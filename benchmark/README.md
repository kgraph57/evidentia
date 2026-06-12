# evidentia-bench (v0)

An open, labelled set of medical citations for measuring how well a tool — or a person —
distinguishes real references from fabricated ones.

## Why

There is no public benchmark for medical citation fabrication. "We tested it on real
papers" is unfalsifiable without a shared, labelled set. This is the seed of one.

## Format

`cases.jsonl` — one JSON object per line:

```json
{"id": "...", "text": "<the citation as it appears in a document>", "expected_tier": 1, "note": "why"}
```

`expected_tier` uses Evidentia's 4-tier scheme:

| Tier | Meaning |
|:----:|---------|
| 1 | Verified — real paper, correct identifier and metadata |
| 3 | Bibliographic mismatch — real paper, wrong DOI/PMID or metadata |
| 4 | Hallucination — identifier resolves to nothing, or to a different paper |

(Tier 2, "used out of context," is a semantic judgement and is out of scope for this
deterministic benchmark.)

## Run it

```bash
npm run build
node benchmark/run.mjs --mailto you@example.com
```

This runs the real engine against the live CrossRef/PubMed/OpenAlex APIs and prints
per-case and overall accuracy.

## Contributing cases

The most valuable additions are **hard cases**: a real paper cited with a subtly wrong
DOI, a fabricated citation that looks plausible, a non-English reference, an unusual
citation style. Open a PR adding a line to `cases.jsonl` with a clear `note` and, where
possible, a link establishing the ground truth.

## Roadmap

- Grow to 100+ cases across specialties and languages.
- Publish per-model fabrication rates: run the same prompts through several LLMs and
  measure how often each invents a citation.
