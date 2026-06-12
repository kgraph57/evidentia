import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyText } from '../src/index.ts';

/**
 * Live integration tests against the real CrossRef / PubMed / OpenAlex APIs.
 * Skipped by default; run with: EVIDENTIA_LIVE=1 npm run test:live
 */
const LIVE = process.env.EVIDENTIA_LIVE === '1';
const opts = { mailto: 'okaken0507@gmail.com' };

test('verifies a real DOI (NEJM BNT162b2)', { skip: !LIVE }, async () => {
  const r = await verifyText('doi:10.1056/NEJMoa2034577', opts);
  assert.equal(r.totalCitations, 1);
  assert.equal(r.citations[0]?.tier.tier, 1);
});

test('verifies a real PMID', { skip: !LIVE }, async () => {
  const r = await verifyText('PMID: 33301246', opts);
  assert.equal(r.citations[0]?.tier.tier, 1);
});

test('flags a fabricated DOI as a hallucination', { skip: !LIVE }, async () => {
  const r = await verifyText('doi:10.1056/NEJMoa9999999 (no such paper)', opts);
  assert.equal(r.citations[0]?.tier.tier, 4);
});

test('flags a real paper cited with an invented DOI as a mismatch', { skip: !LIVE }, async () => {
  const text = 'Polack FP. Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine. N Engl J Med. 2020. doi:10.9999/fake.doi.12345';
  const r = await verifyText(text, opts);
  assert.equal(r.citations[0]?.tier.tier, 3);
});

test('verifies a real ClinicalTrials.gov NCT id', { skip: !LIVE }, async () => {
  const r = await verifyText('The ACTT-1 trial (NCT04280705) of remdesivir.', opts);
  assert.equal(r.citations[0]?.tier.tier, 1);
});

test('flags an unregistered NCT id as a hallucination', { skip: !LIVE }, async () => {
  const r = await verifyText('A study that was never registered. NCT09999999', opts);
  assert.equal(r.citations[0]?.tier.tier, 4);
});

test('computes a fabrication rate across a mixed reference list', { skip: !LIVE }, async () => {
  const text = `References
1. Polack FP. BNT162b2 vaccine. doi:10.1056/NEJMoa2034577
2. Made-up study. doi:10.1056/NEJMoa9999999
3. Real. PMID: 33301246
4. Fake. PMID: 99999999`;
  const r = await verifyText(text, opts);
  assert.equal(r.totalCitations, 4);
  assert.ok(r.fabricationRate >= 0.4 && r.fabricationRate <= 0.6);
});
