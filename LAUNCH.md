# Launch copy

Paste as-is. Do not invent star counts, download numbers, or clinical claims.

- Repo: https://github.com/kgraph57/evidentia
- Site: https://kgraph57.github.io/evidentia/

---

## X / Twitter — Japanese

捏造された医学引用を、公開前に捕まえるオープンソース。

`npx evidentia check` が DOI / PMID / arXiv / NCT を CrossRef・PubMed・OpenAlex・arXiv・ClinicalTrials.gov に照合。4段階判定。APIキー不要。MIT。

臨床判断支援ではありません。

https://kgraph57.github.io/evidentia/

---

## X / Twitter — English

Catch fabricated medical citations before you publish.

`npx evidentia check` resolves DOI / PMID / arXiv / NCT against CrossRef, PubMed, OpenAlex, arXiv, and ClinicalTrials.gov. 4-tier verdict. No API key. MIT.

Not clinical decision support.

https://kgraph57.github.io/evidentia/

---

## Show HN

**Title:** Show HN: Evidentia – catch fabricated medical citations before you publish

AI-written medical text often cites papers that do not exist, or cites a real paper with the wrong DOI or year. Evidentia is an open-source CLI (plus MCP server and agent skill) that checks every DOI, PMID, arXiv id, and NCT trial id against CrossRef, PubMed, OpenAlex, arXiv, and ClinicalTrials.gov.

It does not guess. No API key. Four tiers:

1. Verified — the paper exists and the cited metadata matches
2. Content review needed — registries cannot confirm it, or a real paper still needs a human/LLM for context
3. Bibliographic mismatch — real paper, wrong identifier or metadata
4. Hallucination — the identifier resolves to nothing, or to a different paper

    npx evidentia check your-article.md

Site: https://kgraph57.github.io/evidentia/
Repo: https://github.com/kgraph57/evidentia
License: MIT

Not clinical decision support.
