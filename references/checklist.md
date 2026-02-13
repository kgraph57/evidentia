# Medical Information Evaluation Checklist

Comprehensive checklist for critical appraisal of medical information. Evaluate each item and provide identified issues and improvement suggestions.

## 1. Evidence Level & Study Design

### Check Items
- Is the study design appropriate for the claims being made (RCT, cohort, case report, etc.)?
- Is the evidence hierarchy correctly understood and applied?
- Is study quality sufficient (sample size, bias risk, statistical power)?
- Are animal or in vitro studies overgeneralized to human effects?
- Are preprints distinguished from peer-reviewed publications?
- Is the publication date consistent with current medical consensus?
- For guidelines: was a systematic evidence review conducted?

### Rating Criteria
- **Excellent**: Based on multiple high-quality RCTs or meta-analyses
- **Good**: Based on well-conducted observational studies or a single RCT
- **Fair**: Based on case reports, expert opinion, or unclear evidence basis
- **Poor**: Claims made without evidence, or evidence grossly misrepresented

### Media-Specific Notes
- **Social media**: At minimum, sources should be named or linked
- **Marketing**: Evidence claims require heightened scrutiny for selective reporting
- **Guidelines**: GRADE assessment is expected
- **Patient materials**: Simplified evidence descriptions are acceptable if accurate

---

## 2. Citation & Source Accuracy

### Check Items
- Do cited papers and sources actually exist?
- Does the citation accurately reflect the original paper's conclusions?
- Is the citation context appropriate (no cherry-picking)?
- Are primary sources (original papers) distinguished from secondary sources (news articles)?
- Are identifiers (DOI, PMID, URL) accurate?
- Is citation formatting correct (author names, year, journal)?

### AI Hallucination Detection

AI-generated content (ChatGPT, Claude, Gemini, etc.) frequently contains plausible but fabricated citations. Apply these additional checks:

- **DOI cross-verification**: Does the DOI resolve to the claimed paper (matching title, authors, journal)?
- **Author verification**: Does the author exist and publish in this field?
- **Bibliographic consistency**: Do the journal name, volume, and page numbers match a real publication?
- **Fabrication patterns**: Is the author-title-journal combination "plausible but non-existent"?

### Citation Classification (4 Tiers)

Classify each citation verification result:

| Tier | Classification | Description |
|------|---------------|-------------|
| 1 | **Verified** | Paper exists and content matches the citation |
| 2 | **Content mismatch** | Paper exists but is cited out of context or misrepresented |
| 3 | **Bibliographic mismatch** | Paper exists but DOI, author, or journal info is incorrect |
| 4 | **Hallucination** | DOI points to an unrelated paper, or the paper does not exist at all |

**Critical rule**: Do NOT stop at "could not verify." If a DOI is provided, always check whether the DOI resolves to the correct paper. Actively distinguish between "unverifiable" and "provably fabricated."

### Rating Criteria
- **Excellent**: All citations verified, accurately represented, proper formatting
- **Good**: Citations exist and are mostly accurate; minor formatting issues
- **Fair**: Some citations unverifiable or taken slightly out of context
- **Poor**: Fabricated citations found, or citations grossly misrepresent source material

---

## 3. Statistical Interpretation

### Check Items
- Is there confusion between relative risk and absolute risk?
- Are NNT (number needed to treat) and NNH (number needed to harm) presented when appropriate?
- Is p-value interpretation correct (statistical significance vs. clinical significance)?
- Are confidence intervals presented and correctly interpreted?
- Is effect size appropriately evaluated?
- Are multiple comparison issues considered?
- Are subgroup analysis results overemphasized?

### Common Errors
- Presenting only relative risk reduction (e.g., "50% risk reduction") without absolute risk
- Interpreting p<0.05 as definitive proof of effect
- Equating statistical significance with clinical importance
- Ignoring confidence interval width when interpreting results

### Rating Criteria
- **Excellent**: Statistics correctly interpreted with both relative and absolute measures
- **Good**: Generally correct; minor omissions in nuance
- **Fair**: Some misinterpretation present but not dangerously misleading
- **Poor**: Serious statistical misinterpretation that could mislead decisions

---

## 4. Causation vs. Correlation

### Check Items
- Are correlational findings incorrectly presented as causal?
- Are conditions for causal inference met (temporal sequence, dose-response, biological plausibility)?
- Are confounding variables considered?
- Is reverse causation discussed?

### Rating Criteria
- Causal inference from observational studies should be cautious
- Clear distinction between "associated with" and "causes"
- Application of Bradford Hill criteria where relevant

---

## 5. Bias & Conflicts of Interest

### Check Items
- Is the funding source disclosed?
- Are conflicts of interest (COI) properly disclosed?
- Is there risk of selection bias, information bias, or confounding bias?
- Is publication bias considered (are only positive results reported)?
- What is the author's or presenter's expertise and position?
- Is there potential sponsorship bias?

### Media-Specific Notes
- **Marketing materials**: COI is inherent — evaluate whether it's acknowledged and how it affects claims
- **Guidelines**: Panel member COI disclosures are mandatory per AGREE II
- **Social media influencers**: Check for undisclosed sponsored content
- **Conference presentations**: Industry-sponsored symposia require disclosure

### Rating Criteria
- **Excellent**: Full COI disclosure, balanced presentation, independent replication noted
- **Good**: COI disclosed; minor concerns about balance
- **Fair**: COI partially disclosed or potential bias not addressed
- **Poor**: Undisclosed COI, clear bias, or sponsored content without disclosure

---

## 6. Exaggeration & Overclaiming

### Check Items
- Are there hyperbolic terms ("breakthrough," "revolutionary," "miracle")?
- Are research findings oversimplified?
- Are uncertainty and limitations appropriately conveyed?
- Are definitive statements ("proven," "cures") justified by the evidence?
- Is there a gap between the title/headline and actual content (clickbait)?
- Are exceptions and conditions ignored in generalizations?

### Media-Specific Notes
- **Social media**: Brevity may force simplification, but core accuracy must be maintained
- **Marketing**: Primary concern — regulatory bodies require fair balance
- **Press releases**: Often exaggerate study findings; compare with the actual paper
- **Video thumbnails/titles**: Often sensationalized beyond content

### Rating Criteria
- **Excellent**: Appropriate hedging, limitations stated, balanced language
- **Good**: Mostly balanced; occasional minor overstatement
- **Fair**: Notable exaggeration or missing caveats
- **Poor**: Seriously misleading claims, clickbait, or dangerous overclaiming

---

## 7. Target Population Fit

### Check Items
- Does the study population match the audience being addressed?
- Are age, sex, race, and comorbidity differences considered?
- Are differences in healthcare setting or region accounted for?
- Are adult study results being inappropriately applied to children?
- Are special populations (pregnant, elderly, immunocompromised) addressed?

### Rating Criteria
- **Excellent**: Clear distinction between study population and target audience
- **Good**: Generally appropriate; minor generalizability concerns
- **Fair**: Notable mismatch between study population and intended audience
- **Poor**: Grossly inappropriate extrapolation (e.g., adult data presented as pediatric evidence)

---

## 8. Temporal Validity

### Check Items
- Is the cited information current?
- Are outdated guidelines or recommendations presented as current?
- Are changes in medical consensus reflected?
- Are superseded findings still being cited?

### Rating Criteria
- Alignment with current guidelines (specialty societies, WHO, etc.)
- Priority for literature within the past 5 years (varies by field)
- Acknowledgment when citing older foundational studies

---

## 9. Jargon–Readability Balance

### Check Items
- Is terminology appropriate for the target audience?
- Are technical terms adequately explained?
- Could oversimplification create misunderstanding?
- Are medical terms used correctly?

### Rating by Audience
- **General public**: Minimal jargon, plain language explanations
- **Healthcare professionals**: Accurate technical terminology expected
- **Patients**: Balance between understandability and precision

### Media-Specific Notes
- **Patient leaflets**: Aim for 6th-grade reading level (Flesch-Kincaid)
- **Social media**: Platform-appropriate language
- **Guidelines**: HCP-level language is acceptable
- **Marketing**: Must be accessible to both HCPs and the public

---

## 10. Ethical Considerations

### Check Items
- Is patient dignity and privacy respected?
- Are there stigmatizing expressions?
- Is there fear-mongering or unnecessary anxiety induction?
- Is the promotion of unapproved treatments or alternative medicine appropriate?
- Is the importance of informed consent mentioned?
- Is vulnerable population exploitation avoided?

### Media-Specific Notes
- **Marketing**: Check for manipulation through fear, shame, or false hope
- **Social media**: Stigma amplification risk in viral content
- **Patient materials**: Must respect autonomy and support informed decision-making
- **AI-generated**: Check for biased or insensitive output

### Rating Criteria
- **Excellent**: Patient-centered, respectful, balanced risk-benefit information
- **Good**: Generally appropriate; minor concerns
- **Fair**: Some ethically questionable content
- **Poor**: Stigmatizing, fear-mongering, promotes unproven treatments, or exploits vulnerable populations

---

## 11. Logical Consistency

### Check Items
- Is there a logical connection between claims and evidence?
- Are contradictory statements present?
- Are there logical leaps or missing premises?
- Are conclusions appropriately derived from the evidence?

### Rating Criteria
- **Excellent**: Clear logical flow, conclusions fully supported by evidence
- **Good**: Mostly consistent; minor logical gaps
- **Fair**: Notable inconsistencies or unsupported conclusions
- **Poor**: Fundamental logical errors, contradictions, or non-sequiturs

---

## 12. Images & Figures

### Check Items
- Are image and figure sources cited?
- Is data visualization appropriate (axes, scales, no manipulation)?
- Do images accurately represent the content?
- Are there misleading visual representations?

### Media-Specific Notes
- **Social media**: Infographics and memes require source verification
- **Marketing**: Selective data visualization is common — check for truncated axes, missing comparators
- **Guidelines**: Evidence figures should follow reporting standards
- **Presentations**: Check that graphs aren't reformatted to exaggerate effects

### Rating Criteria
- **Excellent**: All visuals sourced, accurate, and fairly presented
- **Good**: Mostly appropriate; minor issues
- **Fair**: Some misleading visuals or missing sources
- **Poor**: Manipulated data visualization or completely unsourced figures

---

## 13. Alternative Explanations

### Check Items
- Are interpretations other than the presented conclusion considered?
- Are conflicting study results or opinions acknowledged?
- Is the presentation of debatable content balanced?
- Is scientific uncertainty communicated?

### Rating Criteria
- **Excellent**: Multiple perspectives presented, uncertainty acknowledged
- **Good**: Generally balanced; minor omissions of alternative views
- **Fair**: One-sided presentation without acknowledging debate
- **Poor**: Alternative explanations actively suppressed or strawmanned

---

## 14. Clinical Relevance

### Check Items
- Are research findings applicable to real clinical practice?
- Is the recommended intervention feasible?
- Are cost and convenience considered?
- Is the effect size clinically meaningful?

### Rating Criteria
- **Excellent**: Clear clinical applicability, practical recommendations
- **Good**: Generally relevant; minor practicality concerns
- **Fair**: Limited clinical applicability or unrealistic recommendations
- **Poor**: Clinically irrelevant or impractical recommendations presented as actionable

---

## 15. Information Completeness

### Check Items
- Is important information missing (side effects, limitations, alternatives)?
- Is there selective presentation of favorable information only?
- Are both risks and benefits presented?
- Is the range of treatment options comprehensive?

### Media-Specific Notes
- **Social media**: Brevity is expected, but critical safety information must not be omitted
- **Marketing**: Fair balance regulations require disclosure of risks alongside benefits
- **Patient materials**: Must include when to seek professional help
- **Guidelines**: Should address both what to do and what not to do

### Rating Criteria
- **Excellent**: Comprehensive, balanced information for informed decision-making
- **Good**: Mostly complete; minor gaps
- **Fair**: Notable omissions that could affect decision-making
- **Poor**: Critical information missing, or deliberately one-sided presentation
