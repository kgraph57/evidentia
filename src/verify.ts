import type {
  ExtractedCitation,
  ResolvedRecord,
  VerifiedCitation,
  VerifyOptions,
  Discrepancy,
  TierInfo,
} from './types.ts';
import { titleSimilarity, authorMatch, isAssertiveTitle } from './text.ts';
import {
  lookupCrossrefByDoi,
  lookupPubmedByPmid,
  lookupOpenAlexByDoi,
  lookupClinicalTrial,
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

/**
 * Resolve and classify a single citation. Performs deterministic existence and
 * bibliographic verification only; semantic "used in context" judgement is left
 * to the LLM skill and surfaced as Tier 2 there, never assigned here.
 */
export async function verifyCitation(
  c: ExtractedCitation,
  opts: VerifyOptions,
): Promise<VerifiedCitation> {
  // Offline mode is extraction-only: we cannot verify anything against a
  // registry, so report honestly rather than mislabel unverified as fabricated.
  if (opts.offline) {
    return {
      ...c,
      tier: tier(2, 'Content review needed', 'Offline mode: citation extracted but not verified against any registry.'),
      discrepancies: [],
    };
  }

  // A registry being temporarily unavailable must never be reported as
  // "fabricated" — it is an honest "could not verify" (Tier 2).
  try {
    return await classifyOnline(c, opts);
  } catch (err) {
    if (err instanceof RegistryUnavailableError) {
      return {
        ...c,
        tier: tier(2, 'Content review needed', `A citation registry was temporarily unavailable, so this citation could not be verified (${err.message}). Re-run to retry.`),
        discrepancies: [],
      };
    }
    return {
      ...c,
      tier: tier(2, 'Content review needed', `Verification could not be completed (${(err as Error).message}).`),
      discrepancies: [],
    };
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

  if (c.doi) {
    resolved = await lookupCrossrefByDoi(c.doi, opts);
    if (!resolved) resolved = await lookupOpenAlexByDoi(c.doi, opts);
    if (!resolved) {
      // The DOI did not resolve in either registry. Use a title search to tell
      // "fabricated DOI on a real paper" (Tier 3) from "paper does not exist"
      // (Tier 4), with an uncertain middle band reported honestly (Tier 2).
      const byTitle = await searchOpenAlexByTitle(c, opts);
      if (byTitle && byTitle.matchScore >= TITLE_SAME) {
        return {
          ...c,
          resolved: byTitle,
          tier: tier(3, 'Bibliographic mismatch', `DOI ${c.doi} does not resolve, but a paper with this title exists (wrong/invented DOI).`),
          discrepancies: [{ field: 'doi', claimed: c.doi, resolved: byTitle.doi ?? '(none)', similarity: 0 }],
        };
      }
      if (byTitle && byTitle.matchScore >= TITLE_MAYBE) {
        return {
          ...c,
          resolved: byTitle,
          tier: tier(2, 'Content review needed', `DOI ${c.doi} does not resolve. A paper with a similar title exists, but the match is uncertain — verify manually.`),
          discrepancies: [{ field: 'doi', claimed: c.doi, resolved: byTitle.doi ?? '(none)', similarity: byTitle.matchScore }],
        };
      }
      return {
        ...c,
        tier: tier(4, 'Hallucination', `DOI ${c.doi} does not resolve in CrossRef or OpenAlex, and no matching paper was found.`),
        discrepancies: [],
      };
    }
  } else if (c.pmid) {
    resolved = await lookupPubmedByPmid(c.pmid, opts);
    if (!resolved) {
      const byTitle = await searchOpenAlexByTitle(c, opts);
      if (byTitle && byTitle.matchScore >= TITLE_SAME) {
        return {
          ...c,
          resolved: byTitle,
          tier: tier(3, 'Bibliographic mismatch', `PMID ${c.pmid} is not a valid PubMed record, but a paper with this title exists (wrong PMID).`),
          discrepancies: [{ field: 'doi', claimed: `PMID ${c.pmid}`, resolved: byTitle.doi ?? '(none)', similarity: 0 }],
        };
      }
      if (byTitle && byTitle.matchScore >= TITLE_MAYBE) {
        return {
          ...c,
          resolved: byTitle,
          tier: tier(2, 'Content review needed', `PMID ${c.pmid} returns no PubMed record. A paper with a similar title exists, but the match is uncertain — verify manually.`),
          discrepancies: [{ field: 'doi', claimed: `PMID ${c.pmid}`, resolved: byTitle.doi ?? '(none)', similarity: byTitle.matchScore }],
        };
      }
      return {
        ...c,
        tier: tier(4, 'Hallucination', `PMID ${c.pmid} returns no PubMed record, and no matching paper was found.`),
        discrepancies: [],
      };
    }
  } else if (c.nct) {
    // ClinicalTrials.gov registration — must resolve, like a DOI/PMID. The text
    // around an NCT is usually a description ("the ACTT-1 trial"), not the
    // official study title, so existence is the verification — we do not run a
    // title-mismatch check that would false-flag the description.
    resolved = await lookupClinicalTrial(c.nct, opts);
    if (!resolved) {
      return {
        ...c,
        tier: tier(4, 'Hallucination', `${c.nct} is not a registered study on ClinicalTrials.gov.`),
        discrepancies: [],
      };
    }
    return {
      ...c,
      resolved,
      tier: tier(1, 'Verified', `${c.nct} is a registered study on ClinicalTrials.gov ("${resolved.title}"). Context not checked.`),
      discrepancies: [],
    };
  } else if (c.arxiv) {
    // arXiv support is intentionally conservative until the engine resolves
    // arXiv records directly. A preprint identifier should be surfaced for
    // review, never reported as missing metadata or fabricated.
    return {
      ...c,
      tier: tier(2, 'Content review needed', `arXiv preprint (${c.arxiv}) — not auto-verifiable against the current journal/trial registries; verify manually.`),
      discrepancies: [],
    };
  } else if (c.isbn) {
    // Books are not indexed in journal/trial registries; absence is not evidence
    // of fabrication, so never assert a hallucination for an ISBN.
    return {
      ...c,
      tier: tier(2, 'Content review needed', `Book citation (ISBN ${c.isbn}) — not auto-verifiable against journal or trial registries; verify manually.`),
      discrepancies: [],
    };
  } else if (c.claimedTitle) {
    // Identifier-free citation: existence check by title only.
    resolved = await searchOpenAlexByTitle(c, opts);
    if (!resolved || resolved.matchScore < TITLE_MAYBE) {
      // Absence from the indexed literature does NOT prove fabrication for a
      // title-only citation — it may be a guideline, book, website, or other
      // grey literature. Only a failing DOI/PMID/NCT (which must resolve)
      // warrants a hallucination verdict.
      return {
        ...c,
        tier: tier(2, 'Content review needed', 'Not found in the indexed literature. With no DOI/PMID to confirm, this may be a guideline, book, website, or other grey literature — verify manually.'),
        discrepancies: [],
      };
    }
    if (resolved.matchScore < TITLE_SAME) {
      // Plausible but not confident — do not assert existence or fabrication.
      return {
        ...c,
        resolved,
        tier: tier(2, 'Content review needed', 'A paper with a similar title exists, but the match is uncertain (no DOI/PMID to confirm). Verify manually.'),
        discrepancies: [],
      };
    }
    // matchScore ≥ TITLE_SAME — treat as found and fall through to metadata checks.
  } else {
    // Nothing verifiable.
    return {
      ...c,
      tier: tier(2, 'Content review needed', 'No DOI, PMID, or title to verify; manual review required.'),
      discrepancies: [],
    };
  }

  // 2. We have a resolved record. Compare claimed vs resolved metadata.
  const discrepancies = findDiscrepancies(c, resolved);
  const titleDisc = discrepancies.find((d) => d.field === 'title');

  if (titleDisc && titleDisc.similarity < TITLE_DIFFERENT) {
    // The identifier resolves, but to a clearly different paper.
    return {
      ...c,
      resolved,
      tier: tier(4, 'Hallucination', `Identifier resolves to a different paper ("${resolved.title}") than the one cited.`),
      discrepancies,
    };
  }

  if (discrepancies.length > 0) {
    const fields = discrepancies.map((d) => d.field).join(', ');
    return {
      ...c,
      resolved,
      tier: tier(3, 'Bibliographic mismatch', `Paper exists, but cited metadata disagrees with the record (${fields}).`),
      discrepancies,
    };
  }

  return {
    ...c,
    resolved,
    tier: tier(1, 'Verified', 'Paper exists and the cited metadata matches the registry record. Context not checked (run the Evidentia skill for semantic review).'),
    discrepancies: [],
  };
}
