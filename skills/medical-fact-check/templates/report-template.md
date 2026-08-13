# Medical Fact-Check Report

## 1. Content Overview

**Title**: [Title of the content]
**Source**: [URL, publication name, author, etc.]
**Media type**: [Research paper / Blog post / Social media / Newsletter / Video transcript / Slides / Guideline / Marketing / Patient leaflet / AI-generated / Other]
**Target audience**: [General public / Healthcare professionals / Patients / Researchers]
**Evaluation date**: [YYYY-MM-DD]
**Language**: [Language of the evaluated content]

---

## 2. Overall Assessment

**Overall score**: [A / B / C / D / F]

**Adversarial verdict**: [KILL / MAJOR / MINOR / PASS]

**Public health risk level**: [LOW / MEDIUM / HIGH]

**Key issues summary**:
[3–5 sentences summarizing the most important findings]

**Recommended actions**:

- [ ] Critical corrections required
- [ ] Partial corrections recommended
- [ ] Minor improvements suggested
- [ ] No issues found

Scoring gates: a **KILL** forces overall score ≤ D (F if ethics, harm, or fabrication). A **MAJOR** cannot be an A. Do not emit a clean A if the verdict is KILL or MAJOR.

---

## 3. Detailed Evaluation

### 3.1 Evidence Level & Study Design

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of evidence types cited, study designs referenced, and quality of evidence basis]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.2 Citation & Source Accuracy

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of citation practices, source attribution, and verification results]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.3 Statistical Interpretation

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of statistical data usage and interpretation accuracy]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.4 Causation vs. Correlation

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of causal claims and their justification]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.5 Bias & Conflicts of Interest

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of COI disclosure, potential biases, and funding transparency]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.6 Exaggeration & Overclaiming

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of language appropriateness, hedging, and claims vs. evidence alignment]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.7 Target Population Fit

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of population match between studies cited and audience addressed]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.8 Temporal Validity

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of information currency and alignment with current guidelines]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.9 Jargon–Readability Balance

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of terminology appropriateness for the target audience]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.10 Ethical Considerations

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of ethical aspects: stigma, fear-mongering, patient dignity, autonomy]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.11 Logical Consistency

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of logical flow, coherence between claims and evidence]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.12 Images & Figures

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of visual elements, data visualization accuracy, and sourcing]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.13 Alternative Explanations

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of balance in viewpoints, acknowledgment of competing interpretations]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.14 Clinical Relevance

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of real-world applicability and clinical significance]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

### 3.15 Information Completeness

**Rating**: [Excellent / Good / Fair / Poor]

**Current state**:
[Description of coverage of risks, benefits, alternatives, and limitations]

**Issues**:
- [Specific issues, or "None"]

**Suggestions**:
- [Actionable improvement suggestions, if applicable]

---

## 4. Citation Verification Results

[Include this section when the content contains citations. Omit if no citations are present. Engine tier is existence; semantic is honesty — do not collapse them.]

| # | Citation | Engine tier | Semantic | Classification | Notes |
|---|----------|-------------|----------|----------------|-------|
| 1 | [Author, Year, Journal; DOI/PMID/NCT] | [1–4 / unresolved / n/a] | [supports / cherry-pick / mismatch / n/a] | [Verified / Content review needed / Bibliographic mismatch / Hallucination] | [Details; include lookupVerified / resolverOutcomes when useful] |

**Engine JSON** (paste or summarize `evidentia check --format json`; never invent a tier if the engine was not run):

```json
[paste engine output or write "engine not run — citations marked unresolved"]
```

**Summary**: [X] of [Y] citations verified. [Z] hallucinations detected. [N] marked Content review needed (semantic misuse and/or unindexed sources). [U] unresolved (engine unreachable).

---

## 5. Adversarial review

**Pass number**: [1 / 2 / 3 of 3]

### Lenses

1. **Citation integrity**: [pass / fail] — [evidence]
2. **Claim support**: [pass / fail] — [evidence]
3. **Statistics and language**: [pass / fail] — [evidence]
4. **Harm**: [pass / fail] — [evidence]
5. **Steelman then attack**: [steelman survived / did not] — [evidence]

### Steelman

[One paragraph: the author's strongest case, in their own terms, no sarcasm.]

### Attack

[The strongest case that the piece is wrong or misleading.]

### Attack checklist

| # | Question | Yes / No / n/a | Evidence |
|---|----------|----------------|----------|
| 1 | Did I run the engine? If not, marked unresolved rather than guessed a tier? | | |
| 2 | Refused to override any engine Tier 4 to "probably real"? | | |
| 3 | ISBN / guideline / title-only treated as Content review needed, never Hallucination? | | |
| 4 | Read an abstract for each T1 citation used to support a numeric or causal claim? | | |
| 5 | Every cited numeric claim matches the paper's primary finding, population, and effect direction? | | |
| 6 | Every causal verb earned? | | |
| 7 | Relative risk accompanied by absolute risk / NNT where a magnitude is claimed? | | |
| 8 | Could a patient or clinician act on this unsafely? | | |
| 9 | Did the steelman survive the attack? | | |
| 10 | Would I be embarrassed if this DOI 404'd in peer review? | | |

**Verdict**: [KILL / MAJOR / MINOR / PASS]

---

## 6. Loop log

| Loop | Runs | Result | Remaining issues |
|------|------|--------|------------------|
| Engine | [1 or 2; command used] | [JSON received / unreachable → unresolved] | |
| Semantic | [N abstracts fetched; 1 extra lookup max per cite] | [supports / cherry-pick / mismatch / n/a counts] | |
| Adversarial | [pass # of 3] | [KILL / MAJOR / MINOR / PASS] | |
| Correction | [0–3] | [re-entered from engine / cap reached] | |

**Remaining issues after this pass**:
- [List, or "None"]

---

## 7. Critical Concerns

[Flag any high-severity issues that require immediate attention. If none, state "No critical concerns identified."]

---

## 8. Strengths

[List positive aspects of the content that are worth noting.]

---

## 9. Suggested Corrections

[Provide before/after examples for the most important issues.]

### Example 1

**Before**:
> [Problematic text]

**After**:
> [Corrected text]

---

## 10. References

[List the guidelines, papers, and trusted sources used during this evaluation.]

---

## 11. Evaluator Notes

[Overall commentary, caveats about the evaluation, and any limitations of this AI-based review.]

**Disclaimer**: This report was generated by an AI-based evaluation tool and does not replace expert medical judgment. Final medical decisions should always be made by qualified healthcare professionals. This is not clinical decision support.
