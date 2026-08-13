# CITADEL-style title confirmation

Skill-side check after the engine, before a **KILL**. Stolen from CITADEL (Topaz et al., *Lancet* 2026; [maxtopaz.com/citadel](https://www.maxtopaz.com/citadel)). Existence is still the engine. This step only **confirms** a Tier 4. It must not invent a tier and must not override one.

CITADEL's fabrication rule: the *claimed title* returns **0 results** in PubMed, Crossref, OpenAlex, **and** Google Scholar. The dominant pattern in their audit is a plausible title attached to a **real PMID/DOI that resolves to an unrelated paper in the same journal and year**.

The core of detection is not AI judgment. It is a binary check against independent databases. Do not copy CITADEL's LLM title-comparison for existence, and do not copy their exclusion of the 23% of references that lacked a PMID. Grey literature stays **Tier 2**.

## After every engine T4

Take the **claimed title from the draft**, not the registry title the identifier resolved to.

1. Search that claimed title in PubMed (WebSearch / PubMed).
2. Search it in Crossref or OpenAlex (engine traces count if they already did a title search; otherwise WebSearch).
3. One Scholar-like web search of the quoted title.

Record hits in the report's integrity stamp.

| Hits | What it means | What you do |
|------|----------------|-------------|
| **0 in all** | Fabrication confirmed (CITADEL definition). | Keep T4. **KILL** if the draft presents it as a real source. |
| **Title exists under a different identifier** | Swapped PMID/DOI. Engine T4 for the *cited id* is still right. | Keep T4. Do **not** upgrade to T1. Still **KILL** if the draft presents that id as that paper. Note: "claimed work may exist under another id." |
| **Authors "sound real" / same journal-year** | The CITADEL trap. | Never override T4. |

Do not rescue a T4 because a similarly titled paper exists. Do not search until you find something that "could be" the paper.

## After every engine T1

One extra integrity check CITADEL asked publishers to attach as metadata, done here at write time:

- PubMed publication type **Retracted Publication**, or
- Crossref `update-to` / retraction notice.

If yes: ledger note `retracted`. The paper existed (T1 stays T1). It cannot ship as **current** evidence unless the draft says so.

## What this is not

- Not a new engine tier.
- Not permission to override T4.
- Not clinical decision support.
