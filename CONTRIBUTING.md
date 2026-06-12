# Contributing to Evidentia

Thanks for helping make medical writing more trustworthy. Bug reports, citation
edge-cases, and PRs are all welcome.

## Ways to contribute

- **Report a missed or mis-classified citation.** If Evidentia labels a real paper as a
  hallucination (or vice versa), open an issue with the exact input text and the verdict
  you got. False positives and false negatives are the most valuable bug reports.
- **Add a media preset or check item** to the skill (`skills/medical-fact-check/`).
- **Improve extraction** for a citation style the engine misses (a journal format, a
  language, a reference manager's output).
- **Add a benchmark case** to `benchmark/` — a real citation with a known ground-truth label.

## Development

Requires Node.js ≥ 18.

```bash
git clone https://github.com/kgraph57/evidentia.git
cd evidentia
npm install
npm run build        # compile TypeScript to dist/
npm run test:unit    # offline unit tests (no network)
npm run test:live    # live tests against CrossRef/PubMed/OpenAlex
```

The source lives in `src/`:

| File | Responsibility |
|------|----------------|
| `extract.ts` | Pull citations (DOI/PMID/arXiv + nearby title/author/year) from text |
| `registries.ts` | CrossRef / PubMed / OpenAlex clients (keyless) |
| `verify.ts` | Resolve + classify a single citation into a tier |
| `report.ts` | Render Markdown / text reports |
| `cli.ts`, `mcp.ts` | CLI and MCP-server entry points |

## Pull-request checklist

- [ ] `npm run build` passes (no type errors)
- [ ] `npm run test:unit` passes, and you added a test for the behavior you changed
- [ ] New citation-handling logic has a fixture in `test/`
- [ ] No API keys, secrets, or personal data committed
- [ ] Engine changes keep verification **deterministic** — no LLM calls in `src/`

## Design principles

1. **The engine never guesses.** If it can't verify something, it says so (Tier 2) rather
   than inventing a verdict. All fabrication detection must be reproducible.
2. **No API keys.** The engine relies only on free, keyless public registries.
3. **Editorial, not clinical.** Evidentia is a pre-publication aid for writers and editors,
   not a clinical decision-support tool. Keep that framing in code and docs.

## Code of conduct

Be respectful and constructive. Medical misinformation is a serious topic; assume good
faith and keep discussion evidence-based.
