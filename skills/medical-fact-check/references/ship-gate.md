# Ship gate (company / publisher QA)

CITADEL's authors wrote that the barrier is **institutional, not technological**: verify references **before** the next human sees the piece. This file is that barrier for a medical organization.

First customer: **AMPL** (Ken Okamoto). The gate is generic. Any medical org using this skill should run it before shipping.

Not clinical decision support. The gate decides whether *content* may ship. It does not diagnose, treat, or tell a patient what to take. The human still owns the publish click.

## When it applies

Default **on** for AMPL medical copy, and for any org that asked for QA:

- learn / pedia pages
- note / X posts
- client decks and paper-writer output
- READMEs or skill pages that make clinical or epidemiologic claims

A one-off public fact-check still produces the report. The stamp says whether the piece **may ship**.

## Cannot ship

Human still owns the click. The skill's job is to refuse a clean pass.

- Any **T4** presented as a real source
- Adversarial **KILL**
- **HIGH** public-health risk with an unfixed KILL or MAJOR
- Engine **`unresolved`** on a numeric or causal claim (retry already done), unless a human explicitly acks
- **T2** (unindexed or semantic misuse) presented as if it were T1

## Can ship with caveats

- Verdict **PASS** or **MINOR**
- T1 / T3 disclosed (T3 = bibliographic mismatch, already in the draft or the report)
- Retractions labeled
- T2 only if labeled "not registry-verified"

## Integrity stamp (required in the report)

- Engine command and version
- Databases: CrossRef, PubMed, OpenAlex, arXiv, ClinicalTrials.gov
- Timestamp
- CITADEL-style title confirmation done (yes/no) for **each T4**
- Retractions found
- Ship: **no** / **caveats** / **human-ack**
- AMPL QA: yes / no

If the stamp is missing, the gate did not run.
