# Adversarial review

Red-team for *content*, not a manuscript. Run this after the 15-criteria pass and before you emit a letter grade that implies the piece is publishable.

**Purpose:** try to make the content fail before a reader, editor, or regulator does.

This is not clinical decision support. Do not invent treatments. The AI recommends; the human publishes. Record the verdict in the report.

## Five lenses

Short and operational. Answer each with evidence from the claim ledger and the engine JSON, not with a vibe.

### 1. Citation integrity

Trust the engine. Look for swapped DOIs, invented PMIDs, "the author exists but this paper doesn't," title–identifier mismatches, and NCT IDs that resolve to a different trial.

- Engine Tier 4 presented as a real source → this lens fails hard (KILL).
- Engine Tier 3 (bibliographic mismatch) presented as clean → at least MAJOR unless already disclosed in the draft.
- Do not "rescue" a Tier 4 because a similarly titled paper exists.
- **CITADEL dominant pattern (KILL):** a plausible title attached to a real PMID/DOI that resolves to an unrelated paper in the **same journal and year**. Confirm the claimed title is absent (or lives under another id) per `references/citadel-confirmation.md`. Keep the engine T4 either way.

### 2. Claim support

A real paper can still be misquoted. Compare the sentence that cites it with the paper's **primary outcome**, population, and direction of effect.

- Secondary endpoint or subgroup sold as the main finding → cherry-pick (semantic), usually MAJOR.
- Numeric claim with no abstract check on a Tier 1 cite → you have not finished this lens. Go back to the semantic loop (one extra lookup, then stop).

### 3. Statistics and language

Flag RRR without ARR, "causes" from observational data, "breakthrough" / "miracle" / "proven," and surrogate endpoints treated as clinical outcomes. p < 0.05 is not a license for causal verbs.

### 4. Harm

Could a patient or clinician act on this unsafely? Unapproved treatments framed as ready, a dose, an adult result applied to a child, a contraindicated population, or omitted safety-critical caveats in actionable copy.

If following the text as written could cause harm, this is KILL — even when every citation is Tier 1.

### 5. Steelman, then attack

First write **one paragraph** stating the author's strongest case in their own terms (no sarcasm). Then write the strongest case that the piece is wrong or misleading. If the steelman cannot survive that attack, the verdict **cannot be PASS**.

## Verdicts

| Verdict | Meaning | Score consequence |
|---------|---------|-------------------|
| **KILL** | Fabricated citations (any Tier 4 presented as real) **or** advice that could cause harm if followed. Content must not be published as-is. This is the system working. | Overall ≤ D. Use **F** if ethics, harm, or fabrication. |
| **MAJOR** | Real sources, dishonest use: causal overclaim, missing fair balance, cherry-picked primary vs cited sentence. Must fix before publish. | Cannot be an **A**. |
| **MINOR** | Hedging, currency, readability, formatting. Should fix. | Grade as earned; list the fixes. |
| **PASS** | Ship with stated caveats. Human still owns publish. | Grade as earned. |

KILL or MAJOR: do **not** emit a clean A-score as if publishable. Tell the user the content must change. If they revise, re-enter from the **engine**, not from scoring. Max **3** adversarial passes per document (see `references/verification-workflow.md`).

## Attack checklist

The agent must actually answer each line: **yes / no** plus a one-line evidence note. "n/a" is allowed only where a line cannot apply (e.g. no citations). Blank is a fail.

1. Did I run the engine (`evidentia check --format json` or MCP `verify_citations`)? If not, did I mark citations `unresolved` instead of guessing a tier?
2. Did I refuse to override any engine Tier 4 to "probably real," and did I confirm the claimed title is absent from independent databases or swapped onto another id?
3. Did I treat ISBN / guideline / title-only cites as Tier 2 (Content review needed), never Hallucination?
4. Did I read an abstract for each Tier 1 citation used to support a numeric or causal claim? (One extra lookup, then stop.)
5. Does every cited numeric claim match the paper's actual primary finding, population, and effect direction?
6. Is every causal verb earned (not observational data dressed as "causes")?
7. Is relative risk accompanied by absolute risk / NNT where a magnitude is claimed?
8. Could a patient or clinician act on this unsafely (unapproved treatment, dose, adult→child, omitted critical caveat)?
9. Did the steelman survive the attack, or am I grading a piece I already know is misleading?
10. Would I be embarrassed if this DOI 404'd in peer review — or if a regulator quoted this paragraph back at the author?

All ten answered. Then pick KILL / MAJOR / MINOR / PASS and write it in the report.

## How to record it

In the report's **Adversarial review** section:

- One short note per lens (pass / fail + evidence).
- Steelman paragraph.
- Attack paragraph.
- Checklist answers (the ten lines).
- Verdict, and whether this is adversarial pass 1, 2, or 3.

Do not hide a KILL in "Evaluator notes."
