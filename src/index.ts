import type { VerifyOptions, VerifyReport, VerifiedCitation, TierInfo } from './types.ts';
import { extractCitations } from './extract.ts';
import { verifyCitation } from './verify.ts';

export type {
  ExtractedCitation,
  ResolvedRecord,
  VerifiedCitation,
  VerifyReport,
  VerifyOptions,
  Tier,
  TierInfo,
} from './types.ts';
export { extractCitations } from './extract.ts';
export { verifyCitation } from './verify.ts';
export { renderMarkdown, renderText } from './report.ts';

/** Run a bounded number of async tasks concurrently, preserving input order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, worker));
  return out;
}

const EMPTY_COUNTS: Record<TierInfo['label'], number> = {
  Verified: 0,
  'Content review needed': 0,
  'Bibliographic mismatch': 0,
  Hallucination: 0,
};

function tally(citations: VerifiedCitation[]): VerifyReport['counts'] {
  const counts = { ...EMPTY_COUNTS };
  for (const c of citations) counts[c.tier.label]++;
  return counts;
}

/**
 * Extract every citation from `text`, verify each against CrossRef / PubMed /
 * OpenAlex, and return a structured report. Network calls run at a small
 * concurrency to stay polite to the public registries.
 */
export async function verifyText(text: string, opts: VerifyOptions = {}): Promise<VerifyReport> {
  const extracted = extractCitations(text);
  const citations = await mapLimit(extracted, 4, (c) => verifyCitation(c, opts));
  return buildReport(citations);
}

function buildReport(citations: VerifiedCitation[]): VerifyReport {
  const counts = tally(citations);
  const fabricated = counts['Bibliographic mismatch'] + counts.Hallucination;
  return {
    generatedAt: new Date().toISOString(),
    totalCitations: citations.length,
    counts,
    fabricationRate: citations.length ? fabricated / citations.length : 0,
    citations,
  };
}

/**
 * Combine several per-source reports into one aggregate report (re-indexing
 * citations sequentially). Useful for `evidentia check a.md b.md …` and CI.
 */
export function aggregateReports(reports: VerifyReport[]): VerifyReport {
  const citations: VerifiedCitation[] = [];
  for (const r of reports) {
    for (const c of r.citations) citations.push({ ...c, index: citations.length + 1 });
  }
  return buildReport(citations);
}
