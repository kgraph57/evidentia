#!/usr/bin/env node
/**
 * evidentia-bench v0 — score the engine against labelled citations.
 *
 *   npm run build
 *   node benchmark/run.mjs            # uses benchmark/cases.jsonl
 *   node benchmark/run.mjs --mailto you@example.com
 *
 * Each case in cases.jsonl has an `expected_tier`. This runs the real engine
 * against the live registries and reports per-case and overall accuracy.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { verifyText } from '../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mailtoIdx = process.argv.indexOf('--mailto');
const mailto = mailtoIdx >= 0 ? process.argv[mailtoIdx + 1] : undefined;

const raw = await readFile(join(__dirname, 'cases.jsonl'), 'utf8');
const cases = raw.split('\n').filter(Boolean).map((l) => JSON.parse(l));

let correct = 0;
const rows = [];
for (const c of cases) {
  const report = await verifyText(c.text, mailto ? { mailto } : {});
  const got = report.citations[0]?.tier.tier ?? null;
  const ok = got === c.expected_tier;
  if (ok) correct++;
  rows.push({ id: c.id, expected: c.expected_tier, got, ok });
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'}  ${c.id.padEnd(34)} expected T${c.expected_tier}  got T${got ?? '-'}\n`);
}

const acc = ((correct / cases.length) * 100).toFixed(1);
process.stdout.write(`\nAccuracy: ${correct}/${cases.length} (${acc}%)\n`);
process.exitCode = correct === cases.length ? 0 : 1;
