# Claim ledger

Fill **before** the engine call and **before** scoring. Copy this table into the working notes (and into the report if useful). Do not skip it for short social posts — those still have 1–3 testable claims.

**Content:** [title or one-line identifier]
**Date:** [YYYY-MM-DD]

| # | claim (verbatim) | citation / id | engine tier | semantic | adversarial note |
|---|------------------|---------------|-------------|----------|------------------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

Add rows as needed.

**Column values**

- **claim (verbatim):** the testable assertion as written (or a tight quote). Headlines count.
- **citation / id:** DOI, PMID, arXiv id, NCT number, or `none`.
- **engine tier:** `1` / `2` / `3` / `4` / `unresolved` / `n/a`. Never invent a tier if the engine was not run. ISBN / guideline / title-only → `2`, never `4`.
- **semantic:** `supports` / `cherry-pick` / `mismatch` / `n/a` (no abstract, no identifier, or not a literature claim).
- **adversarial note:** short flag from red-team (`T4 presented as real`, `RRR only`, `adult→child`, or blank).

Engine tier is existence. Semantic is honesty. Do not collapse them into one column.
