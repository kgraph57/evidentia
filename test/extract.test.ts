import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCitations } from '../src/extract.ts';

test('extracts a DOI and normalizes it', () => {
  const c = extractCitations('See doi:10.1056/NEJMoa2034577 for details.');
  assert.equal(c.length, 1);
  assert.equal(c[0]?.doi, '10.1056/nejmoa2034577');
});

test('trims trailing punctuation from a DOI', () => {
  const c = extractCitations('(doi:10.1000/abc123).');
  assert.equal(c[0]?.doi, '10.1000/abc123');
});

test('extracts a PMID in both bare and labelled forms', () => {
  const c = extractCitations('Foo. PMID: 33301246. Bar.');
  assert.equal(c[0]?.pmid, '33301246');
});

test('extracts a PMID from a pubmed URL', () => {
  const c = extractCitations('https://pubmed.ncbi.nlm.nih.gov/33301246/');
  assert.equal(c[0]?.pmid, '33301246');
});

test('extracts an arXiv id', () => {
  const c = extractCitations('Preprint arXiv:2501.01234v2 shows...');
  assert.equal(c[0]?.arxiv, '2501.01234');
});

test('deduplicates repeated identifiers', () => {
  const c = extractCitations('doi:10.1000/x and again doi:10.1000/x');
  assert.equal(c.length, 1);
});

test('pulls a quoted title', () => {
  const c = extractCitations('Smith. "A Trial of Widgets in Children." 2020. doi:10.1000/x');
  assert.equal(c[0]?.claimedTitle, 'A Trial of Widgets in Children');
});

test('pulls a Vancouver-style title (before the year)', () => {
  const c = extractCitations(
    '1. Polack FP. Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine. N Engl J Med. 2020. doi:10.1056/NEJMoa2034577',
  );
  assert.equal(c[0]?.claimedTitle, 'Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine');
});

test('does not mistake an author list for a title', () => {
  const c = extractCitations('Polack FP, Thomas SJ, et al. doi:10.1000/x');
  assert.equal(c[0]?.claimedTitle, undefined);
});

test('extracts a year', () => {
  const c = extractCitations('Study (2019). doi:10.1000/x');
  assert.equal(c[0]?.claimedYear, 2019);
});

test('returns nothing when there are no identifiers', () => {
  const c = extractCitations('A health article with no citations at all.');
  assert.equal(c.length, 0);
});

test('handles a multi-reference list', () => {
  const text = `References
1. A. doi:10.1000/a
2. B. PMID: 12345678
3. C. arXiv:2401.00001`;
  const c = extractCitations(text);
  assert.equal(c.length, 3);
});

test('extracts a short (5-digit) PMID', () => {
  const c = extractCitations('An early record. PMID: 12345');
  assert.equal(c[0]?.pmid, '12345');
});

test('does not truncate an over-long digit run into a fake PMID', () => {
  const c = extractCitations('PMID: 1234567890123');
  // 13 digits is not a valid PMID; must not capture a 8-digit prefix.
  assert.equal(c.length, 0);
});

test('extracts a ClinicalTrials.gov NCT id', () => {
  const c = extractCitations('The ACTT-1 trial (NCT04280705) evaluated remdesivir.');
  assert.equal(c[0]?.nct, 'NCT04280705');
});

test('extracts and normalizes an ISBN', () => {
  const c = extractCitations('Nelson Textbook of Pediatrics. ISBN: 978-0-323-52950-1');
  assert.equal(c[0]?.isbn, '9780323529501');
});

test('surfaces an identifier-less reference-list entry instead of skipping it', () => {
  const text = `References
1. Polack FP. BNT162b2 vaccine. doi:10.1056/NEJMoa2034577
2. World Health Organization. Recommendations on antenatal care. Geneva: WHO; 2016.`;
  const c = extractCitations(text);
  assert.equal(c.length, 2);
  // The guideline has no identifier but must still appear, as a title-only citation.
  const guideline = c.find((x) => !x.doi && !x.pmid && !x.nct);
  assert.ok(guideline, 'guideline reference should be surfaced');
  assert.match(guideline!.claimedTitle ?? '', /antenatal care/i);
});

test('does not turn arbitrary numbered prose into citations (no References header)', () => {
  const c = extractCitations('My steps:\n1. Wake up early.\n2. Drink water.\n3. Go for a run.');
  assert.equal(c.length, 0);
});

test('does not bleed one guessed title across multiple identifiers in a span', () => {
  // Two DOIs in a single inline sentence (typical of AI-generated prose).
  const c = extractCitations(
    'As shown in a study of widgets in children doi:10.1000/aaa and also doi:10.1000/bbb here.',
  );
  assert.equal(c.length, 2);
  assert.equal(c[0]?.claimedTitle, undefined);
  assert.equal(c[1]?.claimedTitle, undefined);
});
