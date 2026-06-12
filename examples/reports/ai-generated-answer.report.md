# Evidentia — Citation Verification Report

_Generated 2026-06-12T03:15:59.119Z_

## Summary

- **Citations checked:** 4
- ✅ Verified: 1
- ⚠️ Bibliographic mismatch: 1
- ❌ Hallucination: 2
- 🔍 Content review needed: 0
- **Fabrication rate:** 75.0% (mismatch + hallucination)

## 🚩 Flagged citations

### ❌ [2] doi:10.1056/nejmoa2105512

- **Verdict:** Tier 4 — Hallucination
- **Why:** DOI 10.1056/nejmoa2105512 does not resolve in CrossRef or OpenAlex, and no matching paper was found.
- **Cited as:** a double-blind randomized trial

### ❌ [3] pmid:18768876

- **Verdict:** Tier 4 — Hallucination
- **Why:** Identifier resolves to a different paper ("Trafficking of antigen-specific CD8+ T lymphocytes to mucosal surfaces following intramuscular vaccination.") than the one cited.
- **Cited as:** inactive vitamin D to its active form
- **Registry record:** Trafficking of antigen-specific CD8+ T lymphocytes to mucosal surfaces following intramuscular vaccination. (pubmed)
- **Link:** https://pubmed.ncbi.nlm.nih.gov/18768876/
  - `title` — cited: _inactive vitamin D to its active form_ · record: _Trafficking of antigen-specific CD8+ T lymphocytes to mucosal surfaces following intramuscular vaccination._

### ⚠️ [4] doi:10.1002/14651858.cd012734

- **Verdict:** Tier 3 — Bibliographic mismatch
- **Why:** Paper exists, but cited metadata disagrees with the record (year).
- **Registry record:** Aminoglycosides and metronidazole for people with cirrhosis and hepatic encephalopathy (crossref)
- **Link:** https://doi.org/10.1002/14651858.cd012734
  - `year` — cited: _2019_ · record: _2017_

## All citations

| # | Identifier | Verdict | Registry |
|---|------------|---------|----------|
| 1 | doi:10.1136/bmj.i6583 | ✅ T1 Verified | crossref |
| 2 | doi:10.1056/nejmoa2105512 | ❌ T4 Hallucination | — |
| 3 | pmid:18768876 | ❌ T4 Hallucination | pubmed |
| 4 | doi:10.1002/14651858.cd012734 | ⚠️ T3 Bibliographic mismatch | crossref |

---

> Evidentia checks citation **existence and bibliographic accuracy** deterministically.
> Whether a real citation is used in the right **context** (Tier 2) needs semantic review —
> run the [Evidentia skill](https://github.com/kgraph57/evidentia) in Claude Code for the full 15-criteria appraisal.
