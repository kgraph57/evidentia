import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleSimilarity, isAssertiveTitle, authorMatch } from '../src/text.ts';

test('identical titles score ~1', () => {
  assert.ok(titleSimilarity('Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine',
    'Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine') >= 0.99);
});

test('unrelated titles score low', () => {
  assert.ok(titleSimilarity('Aspirin in primary prevention', 'Quantum entanglement in neonates') < 0.2);
});

test('boilerplate does not inflate a thin match (the false-positive case)', () => {
  // Two unrelated trials sharing only methodology words must not look the same.
  const s = titleSimilarity(
    'A randomized controlled trial of vitamin D',
    'Aspirin: a randomized controlled trial',
  );
  assert.ok(s < 0.8, `expected < 0.8 for boilerplate-only overlap, got ${s}`);
});

test('a few specific shared tokens stay below the "same paper" band', () => {
  // Real vs claimed share only {vitamin, d} after boilerplate removal.
  const s = titleSimilarity(
    'A randomized controlled trial of vitamin D',
    'Vitamin D supplementation: a randomized controlled trial',
  );
  assert.ok(s < 0.8, `expected < 0.8, got ${s}`);
});

test('isAssertiveTitle rejects short descriptions, accepts real titles', () => {
  assert.equal(isAssertiveTitle('Vitamin D review'), false);
  assert.equal(isAssertiveTitle('a landmark trial'), false);
  assert.equal(isAssertiveTitle('Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine'), true);
});

test('authorMatch tolerates initials and order', () => {
  assert.ok(authorMatch('Polack', 'Fernando P Polack') >= 0.8);
  assert.equal(authorMatch('Smith', 'Fernando P Polack'), 0);
});
