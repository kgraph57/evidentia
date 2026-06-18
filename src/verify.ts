import type {
  ExtractedCitation,
  ResolvedRecord,
  VerifiedCitation,
  VerifyOptions,
  Discrepancy,
  TierInfo,
  ResolverOutcome,
  LookupVerified,
} from './types.ts';
import { titleSimilarity, authorMatch, isAssertiveTitle } from './text.ts';
import {
  lookupCrossrefByDoi,
  lookupPubmedByPmid,
  lookupOpenAlexByDoi,
  lookupClinicalTrial,
  lookupArxivById,
  searchOpenAlexByTitle,
  RegistryUnavailableError,
} from './registries.ts';

// Title-match ladder (one coherent scale, used everywhere a title is the evidence):
const TITLE_SAME = 0.8; // confidently the same paper
const TITLE_MAYBE = 0.5; // plausible but uncertain → review, never "fabricated"
const TITLE_DIFFERENT = 0.35; // an assertive title this far off is a different paper

/** Compare claimed metadata against a resolved record, field by field. */
function findDiscrepancies(c: ExtractedCitation, r: ResolvedRecord): Discrepancy[] {
  const out: Discrepancy[] = [];

  // Only let a title drive a verdict when it is an assertive, specific title
  // claim AND it is clearly a different paper. Middling similarity from loosely
  // quoted or descriptive prose is too noisy to call a mismatch on.
  if (isAssertiveTitle(c.claimedTitle) && r.title) {
    const sim = titleSimilarity(c.claimedTitle!, r.title);
    if (sim < TITLE_DIFFERENT) {
      out.push({ field: 'title', claimed: c.claimedTitle!, resolved: r.title, similarity: sim });
    }
  }
  if (c.claimedYear && r.year && Math.abs(c.claimedYear - r.year) > 1) {
    out.push({
      field: 'year',
      claimed: String(c.claimedYear),
      resolved: String(r.year),
      similarity: 0,
    });
  }
  if (c.claimedAuthors?.length && r.authors?.length) {
    const firstClaimed = c.claimedAuthors[0]!;
    const anyMatch = r.authors.some((a) => authorMatch(firstClaimed, a) >= 0.8);
    if (!anyMatch) {
      out.push({
        field: 'author',
        claimed: c.claimedAuthors.join(', '),
        resolved: r.authors.slice(0, 3).join(', '),
        similarity: 0,
      });
    }
  }
  return out;
}

function tier(t: TierInfo['tier'], label: TierInfo['label'], reason: string): TierInfo {
  return { tier: t, label, reason };
}

function outcome(status: ResolverOutcome['status'], queriedBy: ResolverOutcome['queriedBy'], responseSummary?: string): ResolverOutcome {
  return responseSummary ? { status, queriedBy, responseSummary } : { status, queriedBy };
}

function reduceLookupVerified(outcomes: Record<string, ResolverOutcome>): LookupVerified {
  const applicable = Object.values(outcomes).filter((o) => o.status !== 'skipped');
  if (applicable.some((o) => o.status === 'matched')) return 'true';
  if (applicable.some((o) => o.status === 'unmatched' && o.queriedBy === 'id')) return 'false';
  return 'unresolvable';
}

function hasUnreachable(outcomes: Record<string, ResolverOutcome>): boolean {
  return Object.values(outcomes).some((o) => o.status === 'unreachable');
}

function result(
  c: ExtractedCitation,
  resolverOutcomes: Record<string, ResolverOutcome>,
  tierInfo: TierInfo,
  discrepancies: Discrepancy[],
  resolved?: ResolvedRecord,
): VerifiedCitation {
  return {
    ...c,
    ...(resolved ? { resolved } : {}),
    lookupVerified: reduceLookupVerified(resolverOutcomes),
    resolverOutcomes,
    tier: tierInfo,
    discrepancies,
  };
}

async function lookupWithOutcome(
  resolverOutcomes: Record<string, ResolverOutcome>,
  key: string,
  queriedBy: ResolverOutcome['queriedBy'],
  fn: () => Promise<ResolvedRecord | null>,
): Promise<ResolvedRecord | null> {
  try {
    const record = await fn();
    resolverOutcomes[key] = record
      ? outcome('matched', queriedBy, record.title)
      : outcome('unmatched', queriedBy);
    return record;
  } catch (err) {
    if (err instanceof RegistryUnavailableError) {
      resolverOutcomes[key] = outcome('unreachable', null, err.message);
      return null;
    }
    throw err;
  }
}

async function searchTitleWithOutcome(
  c: ExtractedCitation,
  opts: VerifyOptions,
  resolverOutcomes: Record<string, ResolverOutcome>,
): Promise<ResolvedRecord | null> {
  if (!c.claimedTitle) {
    resolverOutcomes.openalexTitle = outcome('skipped', null);
    return null;
  }
  return lookupWithOutcome(
    resolverOutcomes,
    'openalexTitle',
    'title',
    () => searchOpenAlexByTitle(c, opts),
  );
}

/**
 * Resolve and classify a single citation. Performs deterministic existence and
 * bibliographic verification only; semantic "used in context" judgement is left
 * to the LLM skill and surfaced as Tier 2 there, never assigned here.
 */
export async function verifyCitation(
  c: ExtractedCitation,
  opts: VerifyOptions,
): Promise<VerifiedCitation> {
  const offlineOutcomes: Record<string, ResolverOutcome> = {};
  // Offline mode is extraction-only: we cannot verify anything against a
  // registry, so report honestly rather than mislabel unverified as fabricated.
  if (opts.offline) {
    if (c.doi) {
      offlineOutcomes.crossref = outcome('skipped', null);
      offlineOutcomes.openalex = outcome('skipped', null);
    } else if (c.pmid) {
      offlineOutcomes.pubmed = outcome('skipped', null);
    } else if (c.nct) {
      offlineOutcomes.clinicaltrials = outcome('skipped', null);
    } else if (c.arxiv) {
      offlineOutcomes.arxiv = outcome('skipped', null);
    } else if (c.claimedTitle) {
      offlineOutcomes.openalexTitle = outcome('skipped', null);
    }
    return result(
      c,
      offlineOutcomes,
      tier(2, 'Content review needed', 'Offline mode: citation extracted but not verified against any registry.'),
      [],
    );
  }

  // A registry being temporarily unavailable must never be reported as
  // "fabricated" — it is an honest "could not verify" (Tier 2).
  try {
    return await classifyOnline(c, opts);
  } catch (err) {
    if (err instanceof RegistryUnavailableError) {
      return {
        ...result(
          c,
          offlineOutcomes,
          tier(2, 'Content review needed', `A citation registry was temporarily unavailable, so this citation could not be verified (${err.message}). Re-run to retry.`),
          [],
        ),
      };
    }
    return result(
      c,
      offlineOutcomes,
      tier(2, 'Content review needed', `Verification could not be completed (${(err as Error).message}).`),
      [],
    );
  }
}

/**
 * The online resolution + classification path. May throw
 * {@link RegistryUnavailableError}; the public {@link verifyCitation} wrapper
 * translates that into a Tier-2 verdict so one failing lookup never sinks the
 * whole report.
 */
async function classifyOnline(c: ExtractedCitation, opts: VerifyOptions): Promise<VerifiedCitation> {
  // 1. Try to resolve by the strongest identifier available.
  let resolved: ResolvedRecord | null = null;
  const resolverOutcomes: Record<string, ResolverOutcome> = {};

  if (c.doi) {
    resolved = await lookupWithOutcome(
      resolverOutcomes,
      'crossref',
      'id',
      () => lookupCrossrefByDoi(c.doi!, opts),
    );
    if (!resolved) {
      resolved = await lookupWithOutcome(
        resolverOutcomes,
        'openalex',
        'id',
        () => lookupOpenAlexByDoi(c.doi!, opts),
      );
    } else {
      resolverOutcomes.openalex = outcome('skipped', null);
    }
    if (!resolved) {
      // The DOI did not resolve in either registry. Use a title search to tell
      // "fabricated DOI on a real paper" (Tier 3) from "paper does not exist"
      // (Tier 4), with an uncertain middle band reported honestly (Tier 2).
      const byTitle = await searchTitleWithOutcome(c, opts, resolverOutcomes);
      if (byTitle && byTitle.matchScore >= TITLE_SAME) {
        return result(
          c,
          resolverOutcomes,
          tier(3, 'Bibliographic mismatch', `DOI ${c.doi} does not resolve, but a paper with this title exists (wrong/invented DOI).`),
          [{ field: 'doi', claimed: c.doi, resolved: byTitle.doi ?? '(none)', similarity: 0 }],
          byTitle,
        );
      }
      if (byTitle && byTitle.matchScore >= TITLE_MAYBE) {
        return result(
          c,
          resolverOutcomes,
          tier(2, 'Content review needed', `DOI ${c.doi} does not resolve. A paper with a similar title exists, but the match is uncertain — verify manually.`),
          [{ field: 'doi', claimed: c.doi, resolved: byTitle.doi ?? '(none)', similarity: byTitle.matchScore }],
          byTitle,
        );
      }
      if (hasUnreachable(resolverOutcomes)) {
        return result(
          c,
          resolverOutcomes,
          tier(2, 'Content review needed', `DOI ${c.doi} could not be fully verified because one or more citation registries were unavailable. Re-run to retry.`),
          [],
        );
      }
      return result(
        c,
        resolverOutcomes,
        tier(4, 'Hallucination', `DOI ${c.doi} does not resolve in CrossRef or OpenAlex, and no matching paper was found.`),
        [],
      );
    }
  } else if (c.pmid) {
    resolved = await lookupWithOutcome(
      resolverOutcomes,
      'pubmed',
      'id',
      () => lookupPubmedByPmid(c.pmid!, opts),
    );
    if (!resolved) {
      const byTitle = await searchTitleWithOutcome(c, opts, resolverOutcomes);
      if (byTitle && byTitle.matchScore >= TITLE_SAME) {
        return result(
          c,
          resolverOutcomes,
          tier(3, 'Bibliographic mismatch', `PMID ${c.pmid} is not a valid PubMed record, but a paper with this title exists (wrong PMID).`),
          [{ field: 'doi', claimed: `PMID ${c.pmid}`, resolved: byTitle.doi ?? '(none)', similarity: 0 }],
          byTitle,
        );
      }
      if (byTitle && byTitle.matchScore >= TITLE_MAYBE) {
        return result(
          c,
          resolverOutcomes,
          tier(2, 'Content review needed', `PMID ${c.pmid} returns no PubMed record. A paper with a similar title exists, but the match is uncertain — verify manually.`),
          [{ field: 'doi', claimed: `PMID ${c.pmid}`, resolved: byTitle.doi ?? '(none)', similarity: byTitle.matchScore }],
          byTitle,
        );
      }
      if (hasUnreachable(resolverOutcomes)) {
        return result(
          c,
          resolverOutcomes,
          tier(2, 'Content review needed', `PMID ${c.pmid} could not be fully verified because one or more citation registries were unavailable. Re-run to retry.`),
          [],
        );
      }
      return result(
        c,
        resolverOutcomes,
        tier(4, 'Hallucination', `PMID ${c.pmid} returns no PubMed record, and no matching paper was found.`),
        [],
      );
    }
  } else if (c.nct) {
    // ClinicalTrials.gov registration — must resolve, like a DOI/PMID. The text
    // around an NCT is usually a description ("the ACTT-1 trial"), not the
    // official study title, so existence is the verification — we do not run a
    // title-mismatch check that would false-flag the description.
    resolved = await lookupWithOutcome(
      resolverOutcomes,
      'clinicaltrials',
      'id',
      () => lookupClinicalTrial(c.nct!, opts),
    );
    if (!resolved) {
      if (hasUnreachable(resolverOutcomes)) {
        return result(
          c,
          resolverOutcomes,
          tier(2, 'Content review needed', `${c.nct} could not be verified because ClinicalTrials.gov was unavailable. Re-run to retry.`),
          [],
        );
      }
      return result(
        c,
        resolverOutcomes,
        tier(4, 'Hallucination', `${c.nct} is not a registered study on ClinicalTrials.gov.`),
        [],
      );
    }
    return result(
      c,
      resolverOutcomes,
      tier(1, 'Verified', `${c.nct} is a registered study on ClinicalTrials.gov ("${resolved.title}"). Context not checked.`),
      [],
      resolved,
    );
  } else if (c.arxiv) {
    resolved = await lookupWithOutcome(
      resolverOutcomes,
      'arxiv',
      'id',
      () => lookupArxivById(c.arxiv!, opts),
    );
    if (!resolved) {
      if (hasUnreachable(resolverOutcomes)) {
        return result(
          c,
          resolverOutcomes,
          tier(2, 'Content review needed', `arXiv preprint (${c.arxiv}) could not be verified because arXiv was unavailable. Re-run to retry.`),
          [],
        );
      }
      return result(
        c,
        resolverOutcomes,
        tier(4, 'Hallucination', `arXiv ID ${c.arxiv} does not resolve to a preprint record.`),
        [],
      );
    }
  } else if (c.isbn) {
    // Books are not indexed in journal/trial registries; absence is not evidence
    // of fabrication, so never assert a hallucination for an ISBN.
    resolverOutcomes.isbn = outcome('skipped', null);
    return result(
      c,
      resolverOutcomes,
      tier(2, 'Content review needed', `Book citation (ISBN ${c.isbn}) — not auto-verifiable against journal or trial registries; verify manually.`),
      [],
    );
  } else if (c.claimedTitle) {
    // Identifier-free citation: existence check by title only.
    resolved = await searchTitleWithOutcome(c, opts, resolverOutcomes);
    if (!resolved || resolved.matchScore < TITLE_MAYBE) {
      // Absence from the indexed literature does NOT prove fabrication for a
      // title-only citation — it may be a guideline, book, website, or other
      // grey literature. Only a failing DOI/PMID/NCT (which must resolve)
      // warrants a hallucination verdict.
      return result(
        c,
        resolverOutcomes,
        tier(2, 'Content review needed', 'Not found in the indexed literature. With no DOI/PMID to confirm, this may be a guideline, book, website, or other grey literature — verify manually.'),
        [],
      );
    }
    if (resolved.matchScore < TITLE_SAME) {
      // Plausible but not confident — do not assert existence or fabrication.
      return result(
        c,
        resolverOutcomes,
        tier(2, 'Content review needed', 'A paper with a similar title exists, but the match is uncertain (no DOI/PMID to confirm). Verify manually.'),
        [],
        resolved,
      );
    }
    // matchScore ≥ TITLE_SAME — treat as found and fall through to metadata checks.
  } else {
    // Nothing verifiable.
    resolverOutcomes.none = outcome('skipped', null);
    return result(
      c,
      resolverOutcomes,
      tier(2, 'Content review needed', 'No DOI, PMID, or title to verify; manual review required.'),
      [],
    );
  }

  // 2. We have a resolved record. Compare claimed vs resolved metadata.
  const discrepancies = findDiscrepancies(c, resolved);
  const titleDisc = discrepancies.find((d) => d.field === 'title');

  if (titleDisc && titleDisc.similarity < TITLE_DIFFERENT) {
    // The identifier resolves, but to a clearly different paper.
    return result(
      c,
      resolverOutcomes,
      tier(4, 'Hallucination', `Identifier resolves to a different paper ("${resolved.title}") than the one cited.`),
      discrepancies,
      resolved,
    );
  }

  if (discrepancies.length > 0) {
    const fields = discrepancies.map((d) => d.field).join(', ');
    return result(
      c,
      resolverOutcomes,
      tier(3, 'Bibliographic mismatch', `Paper exists, but cited metadata disagrees with the record (${fields}).`),
      discrepancies,
      resolved,
    );
  }

  return result(
    c,
    resolverOutcomes,
    tier(1, 'Verified', 'Paper exists and the cited metadata matches the registry record. Context not checked (run the Evidentia skill for semantic review).'),
    [],
    resolved,
  );
}
