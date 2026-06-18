import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateReports } from '../src/index.ts';
import type { VerifyReport, VerifiedCitation } from '../src/types.ts';

function reportOf(tiers: VerifiedCitation['tier']['tier'][]): VerifyReport {
  const labelOf = (t: number) =>
    t === 1 ? 'Verified' : t === 2 ? 'Content review needed' : t === 3 ? 'Bibliographic mismatch' : 'Hallucination';
  const citations = tiers.map((t, i) => ({
    index: i + 1,
    raw: 'r',
    lookupVerified: t === 1 ? 'true' : t === 2 ? 'unresolvable' : 'false',
    resolverOutcomes: { fixture: { status: t === 1 ? 'matched' : t === 2 ? 'skipped' : 'unmatched', queriedBy: t === 2 ? null : 'id' } },
    tier: { tier: t, label: labelOf(t) as VerifiedCitation['tier']['label'], reason: 'x' },
    discrepancies: [],
  })) as VerifiedCitation[];
  const counts = { Verified: 0, 'Content review needed': 0, 'Bibliographic mismatch': 0, Hallucination: 0 };
  for (const c of citations) counts[c.tier.label]++;
  const fab = counts['Bibliographic mismatch'] + counts.Hallucination;
  return {
    generatedAt: '2026-06-12T00:00:00.000Z',
    totalCitations: citations.length,
    counts,
    fabricationRate: citations.length ? fab / citations.length : 0,
    citations,
  };
}

test('aggregateReports sums citations and re-indexes sequentially', () => {
  const agg = aggregateReports([reportOf([1, 4]), reportOf([1, 1, 3])]);
  assert.equal(agg.totalCitations, 5);
  assert.deepEqual(agg.citations.map((c) => c.index), [1, 2, 3, 4, 5]);
});

test('aggregateReports recomputes counts and fabrication rate across files', () => {
  const agg = aggregateReports([reportOf([1, 4]), reportOf([3, 1])]);
  assert.equal(agg.counts.Verified, 2);
  assert.equal(agg.counts.Hallucination, 1);
  assert.equal(agg.counts['Bibliographic mismatch'], 1);
  assert.equal(agg.fabricationRate, 0.5); // 2 fabricated of 4
});

test('aggregateReports handles an empty set', () => {
  const agg = aggregateReports([]);
  assert.equal(agg.totalCitations, 0);
  assert.equal(agg.fabricationRate, 0);
});
