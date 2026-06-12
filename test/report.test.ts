import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, renderText } from '../src/report.ts';
import type { VerifyReport } from '../src/types.ts';

const report: VerifyReport = {
  generatedAt: '2026-06-12T00:00:00.000Z',
  totalCitations: 3,
  counts: { Verified: 1, 'Content review needed': 0, 'Bibliographic mismatch': 1, Hallucination: 1 },
  fabricationRate: 2 / 3,
  citations: [
    { index: 1, raw: 'r', doi: '10.1/ok', tier: { tier: 1, label: 'Verified', reason: 'matches' }, discrepancies: [] },
    {
      index: 2,
      raw: 'r',
      doi: '10.1/fake',
      claimedTitle: 'Real paper',
      tier: { tier: 3, label: 'Bibliographic mismatch', reason: 'wrong DOI' },
      discrepancies: [{ field: 'doi', claimed: '10.1/fake', resolved: '(none)', similarity: 0 }],
    },
    { index: 3, raw: 'r', pmid: '99999999', tier: { tier: 4, label: 'Hallucination', reason: 'no record' }, discrepancies: [] },
  ],
};

test('markdown report includes the fabrication rate', () => {
  const md = renderMarkdown(report);
  assert.match(md, /Fabrication rate:\*\* 66\.7%/);
});

test('markdown report flags tier 3+ citations', () => {
  const md = renderMarkdown(report);
  assert.match(md, /🚩 Flagged citations/);
  assert.match(md, /\[2\] doi:10\.1\/fake/);
  assert.match(md, /\[3\] pmid:99999999/);
  // Tier 1 should not be flagged.
  assert.doesNotMatch(md, /### ✅ \[1\]/);
});

test('text report is one summary line plus one line per citation', () => {
  const txt = renderText(report);
  const lines = txt.split('\n');
  assert.equal(lines.length, 4);
  assert.match(lines[0]!, /3 citations/);
  assert.match(lines[1]!, /OK/);
  assert.match(lines[2]!, /MIS/);
  assert.match(lines[3]!, /HAL/);
});
