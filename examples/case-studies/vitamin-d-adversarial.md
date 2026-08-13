# Vitamin D adversarial walkthrough

Worked example of the **new** skill pipeline on a committed file. Claim ledger → engine → semantic → 15-criteria skim → adversarial **KILL**. This is not a 15-box recitation. It is not clinical decision support.

| | |
|---|---|
| **Input** | [`examples/inputs/ai-generated-answer.md`](../inputs/ai-generated-answer.md) |
| **Engine report** | [`examples/reports/ai-generated-answer.report.md`](../reports/ai-generated-answer.report.md) (committed) |
| **Media type** | AI-generated medical answer |
| **Adversarial verdict** | **KILL** |
| **Score** | **F** |
| **Public-health risk** | **HIGH** |

KILL is forced by two Tier 4 citations presented as real. Score cannot be A; KILL forces ≤ D. F because fabrication.

---

## Input

Four citations, all formatted as if they were papers. Opening frame: vitamin D for **pediatric** ARTI prevention.

Source: [`examples/inputs/ai-generated-answer.md`](../inputs/ai-generated-answer.md).

What the piece actually asserts, in order:

1. Vitamin D for ARTI has been studied extensively in children.
2. Martineau 2017 IPD meta-analysis: vitamin D reduced at least one ARTI, strongest in the deficient.
3. Yamamoto/Tanaka NEJM 2021 RCT: 1,200 schoolchildren, 47% reduction in influenza A.
4. Hansdottir 2008: vitamin D → cathelicidin in airway epithelium.
5. Bergman 2019 Cochrane: routine supplementation in replete children does not meaningfully reduce ARTI.

Numbers used below are only those written in the input. The 47% figure is a claim in the draft, not a finding we treat as real.

---

## Claim ledger

Filled before the engine call. Engine tier and semantic filled after. Headlines count; the pediatric frame is claim 1.

| # | claim (verbatim) | citation / id | engine tier | semantic | adversarial note |
|---|------------------|---------------|-------------|----------|------------------|
| 1 | "Vitamin D supplementation has been studied extensively for the prevention of acute respiratory tract infections (ARTIs) in pediatric populations." | none (frame) | n/a | n/a | Adult/mixed IPD sold as a pediatric stack |
| 2 | "A large individual participant data meta-analysis found that vitamin D supplementation reduced the risk of at least one ARTI, with the strongest effect in those who were deficient at baseline" | doi:10.1136/bmj.i6583 | **1** | supports (ARTI, deficient); cherry-pick (population) | Real paper, stretched toward children |
| 3 | "A subsequent randomized controlled trial in 1,200 schoolchildren demonstrated a 47% reduction in influenza A incidence with daily vitamin D3 supplementation" | doi:10.1056/nejmoa2105512 | **4** | n/a | **T4 presented as real → KILL** |
| 4 | "Mechanistic work has linked vitamin D to cathelicidin-mediated antimicrobial activity in the airway epithelium" | pmid:18768876 | **4** | n/a | **T4 presented as real → KILL** |
| 5 | "A 2019 Cochrane review concluded that routine supplementation in vitamin-D-replete children does not meaningfully reduce ARTI frequency" | doi:10.1002/14651858.cd012734 | **3** | n/a | DOI is a 2017 cirrhosis Cochrane, not vitamin D. Keep T3. Dishonest use → at least MAJOR |

Engine tier is existence. Semantic is honesty. They stay in separate columns. T3/T4 do not get a semantic upgrade.

---

## Engine loop

Engine was reachable. No retry. No `unresolved`. Output is ground truth for existence. Do not override any tier.

Committed CLI summary:

```text
$ npx evidentia check examples/inputs/ai-generated-answer.md

Evidentia: 4 citations — 1 verified, 1 mismatch, 2 hallucinated (75.0% fabrication rate)
  [OK ] doi:10.1136/bmj.i6583       — Paper exists and the cited metadata matches the registry record.
  [HAL] doi:10.1056/nejmoa2105512   — DOI does not resolve in CrossRef or OpenAlex, and no matching paper was found.
  [HAL] pmid:18768876               — Identifier resolves to a different paper ("Trafficking of antigen-specific
                                       CD8+ T lymphocytes…") than the one cited.
  [MIS] doi:10.1002/14651858.cd012734 — Paper exists, but cited metadata disagrees with the record (year).
```

Full report: [`examples/reports/ai-generated-answer.report.md`](../reports/ai-generated-answer.report.md).

| Identifier | Engine | Why (from the committed report) |
|------------|--------|----------------------------------|
| doi:10.1136/bmj.i6583 | T1 Verified | CrossRef record matches cited metadata. Martineau et al., *BMJ* 2017, IPD meta-analysis of vitamin D for ARTI. **REAL.** |
| doi:10.1056/nejmoa2105512 | T4 Hallucination | DOI does not resolve. Yamamoto/Tanaka *NEJM* 2021 “1,200 schoolchildren, 47% influenza A” is fabricated. |
| pmid:18768876 | T4 Hallucination | Resolves to a *different* paper: “Trafficking of antigen-specific CD8+ T lymphocytes to mucosal surfaces following intramuscular vaccination.” Not Hansdottir on vitamin D/cathelicidin. |
| doi:10.1002/14651858.cd012734 | T3 Bibliographic mismatch | Year cited 2019 vs record 2017. Registry record: “Aminoglycosides and metronidazole for people with cirrhosis and hepatic encephalopathy” — **not** a vitamin D Cochrane. |

**Hard rule on the Cochrane DOI:** the engine said T3. This walkthrough does **not** promote it to T4. A real Cochrane record exists at that identifier; the metadata (year) disagrees, and the record title is a different review. Existence = T3. Honesty of use is adversarial, below.

---

## Semantic loop

Scope: Tier 1 only. One extra abstract lookup per T1 cite, then stop. Do not use this loop to upgrade a T3 or T4. Existence already failed for those.

### doi:10.1136/bmj.i6583 — Martineau et al., *BMJ* 2017 (T1)

- **Supports** the ARTI finding as written: an IPD meta-analysis reported that vitamin D supplementation reduced the risk of at least one ARTI, with the strongest effect in people who were deficient at baseline. That sentence is in the right family.
- **Cherry-pick / stretch on population.** The example frames the whole stack as pediatric. The IPD included mixed ages. Strongest signal in the deficient, not “in children.” The draft never says the IPD was mixed-age. That is a population stretch, not a fabricated paper.
- No numbers beyond the input are used here. We do not invent an odds ratio, a percentage, or an NNT for Martineau.

### T4 and T3 — semantic `n/a`

- **doi:10.1056/nejmoa2105512** — no paper. There is no abstract to fetch. Semantic n/a. The 47% is unverifiable because the trial does not exist. Do not treat 47% as a real statistic.
- **pmid:18768876** — the identifier’s paper is about CD8+ T-cell trafficking after intramuscular vaccination, not vitamin D or cathelicidin. Semantic n/a; existence already failed (T4). Do not “rescue” it by finding some other Hansdottir paper.
- **doi:10.1002/14651858.cd012734** — engine T3. Semantic loop does not run to upgrade or re-tier. The registry title is a cirrhosis/hepatic-encephalopathy Cochrane. Using that DOI as a 2019 vitamin D Cochrane is an honesty problem for adversarial review, not a new engine tier.

---

## 15-criteria skim

Not a fake A–F of all 15. The items that actually move this draft:

| # | Criterion | Rating | Why it moves |
|---|-----------|--------|--------------|
| 2 | Citation & source accuracy | **Poor** | 2× T4 presented as real; 1× T3 (cirrhosis Cochrane sold as vitamin D, 2019 vs 2017). Fabrication rate 75% on the committed engine run. |
| 3 | Statistical interpretation | **Poor** | “47% reduction in influenza A” has no paper behind it. Unverifiable. Do not interpret it as RRR vs ARR; there is no trial. |
| 4 | Causation vs. correlation | **Poor** | “Demonstrated a 47% reduction” is causal language hanging on a fabricated RCT. Martineau’s “reduced the risk” is earned *for that IPD*; the stack then launders causation through two fakes and a wrong Cochrane. |
| 6 | Exaggeration & overclaiming | **Poor** | One real mixed-age IPD is padded with a fake pediatric RCT, a fake mechanism paper, and a misidentified Cochrane so the piece looks like a complete evidence pyramid. |
| 7 | Target population fit | **Poor** | Opens as pediatric ARTI. The only real paper is not a pediatric-only IPD. The schoolchild RCT that would have closed the gap does not exist. |
| 10 | Ethical considerations | **Poor** | Fabricated pediatric evidence, presented as NEJM/Cochrane-grade fact. That is an ethics failure of the *content*, not a treatment recommendation. |

Items 1, 5, 8, 9, 11–15: **not scored in depth for this demo.** Honest reason: the draft dies on citation integrity before a full rubric pass would change the letter. A complete 15-box report would still be gated by KILL.

Overall letter is not computed from a 15-item average. See verdict.

---

## Adversarial

Five lenses, then steelman, then attack, then the 10-line checklist. Evidence from the ledger and the committed engine report — not vibes.

### 1. Citation integrity — FAIL (KILL)

Two engine T4s presented as real sources:

- `doi:10.1056/nejmoa2105512` does not resolve. Yamamoto/Tanaka *NEJM* 2021 is fabricated.
- `pmid:18768876` resolves to an unrelated CD8+ trafficking paper, cited as Hansdottir vitamin D/cathelicidin.

T4 presented as real is a hard KILL on this lens. Do not rescue either cite because “a similarly titled paper might exist.”

The Cochrane DOI stays **T3**. Real record, wrong year, wrong review (cirrhosis, not vitamin D). Presented as a clean 2019 vitamin D Cochrane → at least MAJOR on this cite. It does not need to be promoted to T4 to kill the piece; the two T4s already do.

### 2. Claim support — FAIL

- Martineau: ARTI reduction in the deficient is supported; pediatric-only framing is a stretch (cherry-pick on population).
- 1,200 schoolchildren / 47% influenza A: no paper, so the claim has zero support.
- Cathelicidin mechanism: identifier points at a different paper.
- “2019 Cochrane… replete children”: the DOI’s record is a 2017 aminoglycosides/metronidazole review in cirrhosis.

### 3. Statistics and language — FAIL

The only specific magnitude in the draft is **47%**. It is attached to a T4. Unverifiable. No ARR, no NNT, and no trial from which those could be derived. Causal verb (“demonstrated”) on a ghost RCT.

### 4. Harm — FAIL (fabrication; not a dosing instruction)

The copy does not give a dose and does not tell a clinician to give or withhold vitamin D. This walkthrough does not either.

What it does: publish a fake pediatric influenza RCT and a fake mechanism paper as if they were evidence. A parent or a non-expert reader could treat “47% fewer influenza A cases in 1,200 schoolchildren, *NEJM*” as a reason to act. That is why public-health risk is **HIGH**. The KILL trigger remains **fabrication** (two T4s presented as real), not a CDS harm rule.

### 5. Steelman, then attack

**Steelman (honest):** Vitamin D for pediatric ARTI has a real IPD signal in deficient people (Martineau 2017); the piece tries to add an RCT, a mechanism paper, and a Cochrane.

**Attack:** Two of four citations are fabrications; the “Cochrane” DOI is a cirrhosis review; the only real paper is stretched toward children.

The steelman does not survive the attack. Verdict cannot be PASS.

### Attack checklist

Each line: yes/no + evidence. Blank would be a fail.

| # | Question | Answer |
|---|----------|--------|
| 1 | Did I run the engine (`evidentia check --format json` or MCP `verify_citations`)? If not, did I mark citations `unresolved` instead of guessing a tier? | **Yes.** Committed run on `examples/inputs/ai-generated-answer.md`. Engine reachable. Report: `examples/reports/ai-generated-answer.report.md`. No `unresolved`. |
| 2 | Did I refuse to override any engine Tier 4 to “probably real”? | **Yes.** Both T4s stay T4. No “Yamamoto might be real under another DOI.” |
| 3 | Did I treat ISBN / guideline / title-only cites as Tier 2, never Hallucination? | **n/a.** All four cites have DOI or PMID. |
| 4 | Did I read an abstract for each Tier 1 citation used to support a numeric or causal claim? (One extra lookup, then stop.) | **Yes.** One T1: Martineau. Semantic loop run once. T3/T4 not upgraded via this loop. |
| 5 | Does every cited numeric claim match the paper’s actual primary finding, population, and effect direction? | **No.** 47% has no paper. Cochrane “conclusion” is attached to a cirrhosis review. |
| 6 | Is every causal verb earned (not observational data dressed as “causes”)? | **No.** “Demonstrated a 47% reduction” is unearned. Martineau’s “reduced the risk” is earned for that IPD only. |
| 7 | Is relative risk accompanied by absolute risk / NNT where a magnitude is claimed? | **No.** The 47% stands alone — and is unverifiable. |
| 8 | Could a patient or clinician act on this unsafely (unapproved treatment, dose, adult→child, omitted critical caveat)? | **No dose, no give/withhold instruction.** The copy is still unsafe *as evidence*: a fake schoolchild RCT plus mixed-age IPD framed as pediatric. KILL is fabrication, not a treatment order. This report does not recommend giving or withholding vitamin D. |
| 9 | Did the steelman survive the attack, or am I grading a piece I already know is misleading? | **No.** Steelman dies. Two T4s + a cirrhosis Cochrane + a population stretch. |
| 10 | Would I be embarrassed if this DOI 404’d in peer review — or if a regulator quoted this paragraph back at the author? | **Yes.** Two of four identifiers fail in public registries. The “Cochrane” DOI 200s to the wrong review. |

All ten answered. Adversarial pass **1**.

---

## Verdict

| | |
|---|---|
| **Adversarial** | **KILL** |
| **Score** | **F** |
| **Public-health risk** | **HIGH** |
| **Publish as-is?** | **No.** |

**Why KILL:** two Tier 4 citations presented as real (Yamamoto/Tanaka *NEJM* DOI that does not resolve; PMID 18768876 pointing at a CD8+ trafficking paper). That is the hard rule.

**Why F, not D:** KILL already forces ≤ D. Fabrication takes it to F.

**Why not A:** KILL or MAJOR cannot ship as A. Irrelevant here; the piece is not close.

**Why HIGH:** fabricated pediatric RCT evidence, stacked on a real IPD that was stretched toward children, plus a Cochrane DOI that belongs to a cirrhosis review. Vulnerable population (children), respiratory-infection claims, confident scholarly voice.

The T3 Cochrane is **MAJOR** on honesty (wrong review, wrong year, presented as vitamin D 2019). It is not re-tiered to T4.

---

## Loop log

| Loop | Runs | Result |
|------|------|--------|
| Engine | **1** | Reachable. 1× T1, 1× T3, 2× T4. 0 unresolved. No retry. |
| Semantic | **1** (T1 Martineau only) | supports ARTI/deficient; cherry-pick on pediatric framing. T3/T4 = n/a. |
| Adversarial | **pass 1** | **KILL** |
| Correction | **0** | Not run. No revised article in this demo. |

Remaining issues if anyone tries to publish this file: both T4s, the T3 Cochrane identity, the pediatric stretch on Martineau.

---

## What a correction loop would demand

Do not write a fake revised article. If the author actually revises, re-enter from the **engine**, not from scoring. Cap 3.

A publishable rewrite would have to:

1. **Remove** `doi:10.1056/nejmoa2105512` and the Yamamoto/Tanaka 1,200-schoolchildren / 47% influenza A sentence. There is no paper to swap in from this identifier.
2. **Remove** `pmid:18768876` as a Hansdottir/cathelicidin cite. The PMID is a different paper. Either drop the mechanism sentence or cite a real paper whose identifier actually points at it — then re-run the engine on the new identifier.
3. **Replace or drop** `doi:10.1002/14651858.cd012734`. It is not a 2019 vitamin D Cochrane. Keeping the DOI and changing only the year is not a fix; the record is a cirrhosis review. Engine tier stays T3 until the identifier changes.
4. **Hedge Martineau on population.** Say what the IPD is: mixed ages, strongest in deficient people. Do not open as if the evidence base were pediatric-only.

After those edits: engine again → semantic on remaining T1 → adversarial pass 2. Do not raise the letter while a T4 or a KILL remains.

This walkthrough stops here. No invented replacement citations. No “corrected” vitamin D article.

---

## Not CDS

Evidentia is a pre-publication aid for writers, editors, and researchers — **not clinical decision support.** This case study evaluates how the *content* is sourced. It does not diagnose, treat, or replace professional medical judgment.

**Do not read this file as a reason to give vitamin D, withhold vitamin D, or change a pediatric ARTI protocol.** The only operational output is: this draft must not ship.

Operating model: [`skills/medical-fact-check/references/verification-workflow.md`](../../skills/medical-fact-check/references/verification-workflow.md). Adversarial rules: [`skills/medical-fact-check/references/adversarial-review.md`](../../skills/medical-fact-check/references/adversarial-review.md).
