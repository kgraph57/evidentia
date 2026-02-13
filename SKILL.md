---
name: medical-fact-check
description: "Comprehensive medical fact-checking and critical appraisal skill. Evaluates any medical content — research papers, articles, social media posts, newsletters, YouTube/podcast transcripts, conference slides, clinical guidelines, pharma marketing, patient leaflets, health app content, and more — across 15 criteria for accuracy, evidence quality, and appropriateness. Generates a structured Markdown report with an A–F score and actionable improvement suggestions. Triggers: 'fact-check', 'evidence check', 'evaluate this article', 'check this post', 'ファクトチェック', 'エビデンスチェック', 'この記事を評価して', 'この投稿の問題点'."
---

# Medical Fact-Check Skill

Comprehensive critical appraisal and fact-checking for medical information, producing a structured report.

## Overview

This skill evaluates medical information across **15 criteria** — evidence quality, citation accuracy, statistical interpretation, ethical considerations, and more — then generates a structured Markdown report with an overall **A–F score** and actionable improvement suggestions.

### Supported Media Types

The skill auto-detects the content type and adjusts its evaluation accordingly:

| Category | Examples | Key Focus |
|----------|----------|-----------|
| **Research papers** | Journal articles, preprints, systematic reviews | Evidence level, methodology, statistical rigor |
| **News & articles** | Health news, medical blogs, magazine articles | Accuracy of claims, source attribution, exaggeration |
| **Social media** | X (Twitter), Instagram, TikTok captions, Reddit, note | Brevity-induced omissions, clickbait, misinformation risk |
| **Newsletters** | Email newsletters, Substack, medical columns | Citation completeness, audience calibration |
| **Patient materials** | Leaflets, brochures, hospital handouts | Readability, completeness, fear-mongering |
| **Video/audio transcripts** | YouTube, podcasts, webinar transcripts | Verbal exaggeration, missing nuance, source attribution |
| **Presentations** | Conference slides, lecture materials, grand rounds | Slide oversimplification, citation on slides |
| **Clinical guidelines** | Practice guidelines, protocols, algorithms | AGREE II compliance, evidence grading, conflicts of interest |
| **Marketing materials** | Pharma ads, medical device brochures, supplement claims | Regulatory compliance, selective data presentation, COI |
| **Health apps & digital** | App descriptions, chatbot outputs, AI-generated content | Hallucination detection, accuracy of automated advice |
| **Textbooks & education** | Textbook chapters, CME/CPD materials, study guides | Currency, completeness, pedagogical accuracy |
| **Infographics** | Visual summaries, data visualizations, social cards | Data integrity, oversimplification, source attribution |

### The 15 Evaluation Criteria

1. Evidence level & study design
2. Citation & source accuracy (incl. AI hallucination detection)
3. Statistical interpretation
4. Causation vs. correlation
5. Bias & conflicts of interest
6. Exaggeration & overclaiming
7. Target population fit
8. Temporal validity
9. Jargon–readability balance
10. Ethical considerations
11. Logical consistency
12. Images & figures
13. Alternative explanations
14. Clinical relevance
15. Information completeness

### Scoring

Each item is rated **Excellent / Good / Fair / Poor**. The overall score:

| Score | Criteria |
|-------|----------|
| **A** | 12+ Excellent, 0 Poor |
| **B** | 12+ Excellent or Good, ≤1 Poor |
| **C** | 12+ Fair or better, ≤2 Poor |
| **D** | 3+ Poor |
| **F** | 5+ Poor, or critical ethical issues |

## Workflow

### Step 1: Acquire & Analyze

Receive the target medical content from the user. Depending on the input format:

- **URL** — use `WebFetch` to retrieve the content
- **File path** — use `Read` to load the file
- **Pasted text** — analyze directly
- **Video/audio** — if a transcript is provided, analyze it; if a URL is given, attempt to retrieve transcript via WebFetch

Identify the following:

- **Content type**: research paper, blog post, social media, patient leaflet, video transcript, etc.
- **Target audience**: general public, healthcare professionals, patients, researchers, etc.
- **Main claims**: what the content is asserting
- **Citations present**: whether evidence is referenced
- **Language**: the language of the content (evaluate in the original language)
- **Public health risk level**: LOW (educational, niche), MEDIUM (widely shared, actionable claims), HIGH (viral content, safety-critical claims, vulnerable populations)

#### Media-Specific Pre-Analysis

Adjust the evaluation lens based on detected media type:

**Social media posts:**
- Character/space constraints may justify brevity, but core accuracy must be maintained
- Check for misleading compression of complex findings
- Evaluate whether the post drives readers to reliable sources

**Video/podcast transcripts:**
- Verbal hedging may be lost in transcription — look for spoken qualifiers
- Hosts may editorialize beyond guest experts' actual statements
- Check if timestamps or show notes reference sources

**Marketing materials:**
- Apply heightened scrutiny for selective data presentation
- Check regulatory compliance (FDA, PMDA, EMA guidelines for claims)
- Identify undisclosed conflicts of interest

**Clinical guidelines:**
- Apply AGREE II framework for guideline quality assessment
- Check for systematic evidence review methodology
- Verify COI disclosures of guideline panel members

**AI-generated content:**
- Apply maximum citation verification rigor (hallucination detection)
- Check for "confident but wrong" patterns typical of LLM output
- Verify all specific numbers, dates, and named entities

### Step 2: Load Evaluation Checklist

Read `~/.claude/skills/medical-fact-check/references/checklist.md` with the `Read` tool to load the detailed 15-item evaluation checklist.

### Step 3: Assess Evidence Levels

If the content references research studies, read `~/.claude/skills/medical-fact-check/references/evidence-levels.md` with the `Read` tool and evaluate:

- Study design type (RCT, cohort, case report, etc.)
- Study quality (bias risk, sample size, etc.)
- GRADE assessment for overall quality
- Domain-specific considerations (pediatrics, oncology, etc.)

### Step 4: Verify Citations

If the content cites papers or sources, verify them using `WebSearch`:

1. **Search** by DOI, PMID, or title to locate the original paper
2. **Cross-check** the abstract or full text against the cited claims
3. **Evaluate context** — is the citation cherry-picked or accurately represented?
4. **DOI cross-verification** — if a DOI is provided, confirm the DOI resolves to the claimed paper (matching title, authors, journal)

#### AI Hallucination Detection (Critical)

AI-generated text (ChatGPT, Claude, Gemini, etc.) frequently contains plausible but fabricated citations. When a citation cannot be confirmed, perform these additional checks:

- Does the DOI point to a completely different paper? (Search the DOI directly and compare title/authors)
- Does the author actually exist and publish in this field?
- Do the journal name, volume, and page numbers match a real publication?

**Do NOT stop at "could not verify."** Actively determine whether the citation is unverifiable or provably fabricated.

Classify each citation into one of 4 tiers:

| Tier | Classification | Description |
|------|---------------|-------------|
| 1 | **Verified** | Paper exists and content matches the citation |
| 2 | **Content mismatch** | Paper exists but is cited out of context |
| 3 | **Bibliographic mismatch** | Paper exists but DOI, author, or journal info is wrong |
| 4 | **Hallucination** | DOI points to an unrelated paper, or the paper does not exist |

### Step 5: Detailed Evaluation

Rate each of the 15 items using these dimensions:

- **Current state**: objective description of how the content handles this criterion
- **Issues**: specific problems identified (or "None")
- **Suggestions**: concrete, actionable improvements (if issues exist)
- **Rating**: Excellent / Good / Fair / Poor

#### Media-Specific Evaluation Adjustments

| Criterion | Social Media | Marketing | Guidelines | Patient Materials |
|-----------|-------------|-----------|------------|-------------------|
| #1 Evidence level | Expect source links | Heightened scrutiny | GRADE required | Simplified OK |
| #2 Citations | At minimum, name sources | Full disclosure required | Systematic search required | Source available on request |
| #6 Exaggeration | Very common — flag aggressively | Primary concern | Should be absent | Watch for false reassurance |
| #7 Population fit | Often ignored — flag | Check indication scope | Must be explicit | Must match audience |
| #9 Readability | Platform-appropriate | Accessible to HCPs + public | HCP-level acceptable | 6th-grade reading level |
| #10 Ethics | Check stigma/fear | Check manipulation | Check COI panel | Check dignity/autonomy |
| #12 Images | Memes, infographics | Selective visuals | Evidence figures | Clear illustrations |

### Step 6: Determine Overall Score

Aggregate the 15 item ratings into an A–F score using the criteria table in the Overview section.

Additionally, flag a **Public Health Risk Assessment**:

- **LOW RISK**: Content is broadly accurate; issues are minor or stylistic
- **MEDIUM RISK**: Content has meaningful inaccuracies that could mislead readers
- **HIGH RISK**: Content promotes harmful actions, contains fabricated evidence, or targets vulnerable populations with dangerous misinformation

### Step 7: Generate Report

Read the report template from `~/.claude/skills/medical-fact-check/templates/report-template.md` with the `Read` tool and produce the structured report.

**Required sections:**
1. Content Overview — title, source, audience, date, media type
2. Overall Assessment — score, key issues summary, risk level, recommended actions
3. Detailed Evaluation — all 15 items with ratings, issues, and suggestions
4. Citation Verification Results — tier classification for each citation (if applicable)
5. Critical Concerns — flagged high-severity issues
6. Strengths — positive aspects worth noting
7. Suggested Corrections — before/after comparison text (if issues found)
8. References — sources used during evaluation
9. Evaluator Notes — overall commentary and caveats

### Step 8: Deliver Report

Save the completed report as a Markdown file using `Write`:

- **File name**: `medical-fact-check-report-YYYY-MM-DD.md` in the current directory
- If a report with that name already exists, append a suffix: `-2`, `-3`, etc.
- Provide the user with:
  - The file path
  - A concise summary of findings (3–5 sentences)
  - The overall score and risk level
  - Top 3 most important issues to address

### Step 9: Post-Correction Re-Verification (Optional)

If the user revises the content based on the report and requests re-evaluation:

1. Re-read the revised content
2. Check that flagged issues have been properly addressed
3. Update the recommended-actions checklist (mark resolved items)
4. Verify that corrections haven't introduced new problems (e.g., shifted reference numbers)
5. List any remaining unresolved issues
6. Save the updated report with a `-rev2` (or `-rev3`, etc.) suffix

## Media-Specific Handling

### Social Media Posts

Short-form content requires particular attention to:
- Accuracy maintained despite brevity constraints
- Absence of critical caveats or disclaimers
- Clickbait titles or misleading framing
- Whether sources are linked or accessible
- Potential for viral spread of misinformation (amplification risk)

### Video & Podcast Transcripts

Audio/video content often has unique issues:
- Host editorialization beyond guest expert statements
- Verbal hedging that doesn't survive transcription
- Unsubstantiated anecdotes presented as evidence
- Missing visual context in audio-only formats
- Show notes or descriptions that may overstate content

### Conference Presentations & Slides

Slide decks present compressed information:
- Oversimplification of complex findings to fit slides
- Missing citations on individual slides
- Unpublished data presented without caveats
- Potential COI with industry-sponsored presentations
- Conclusions drawn from preliminary/incomplete data

### Clinical Guidelines

Guidelines demand the highest methodological standards:
- AGREE II framework compliance
- Systematic literature review methodology
- GRADE evidence assessment
- Panel member COI disclosures
- Update currency and version control
- Patient/public involvement in development

### Pharmaceutical & Device Marketing

Marketing materials require heightened skepticism:
- Selective presentation of favorable trial results
- Relative risk reduction without absolute figures
- Off-label use implications
- Regulatory compliance of claims
- Fair balance between efficacy and safety data
- Comparator selection bias

### AI-Generated Medical Content

LLM-generated content requires the most rigorous citation checking:
- Apply hallucination detection to ALL citations
- Verify specific statistics, percentages, and dates
- Check for "confident confabulation" — authoritative tone on incorrect facts
- Flag instances where the AI fills knowledge gaps with plausible fiction
- Verify named entities (researchers, institutions, journals)

### Patient-Facing Materials

Patient materials prioritize accessibility and safety:
- Reading level appropriate for target audience (aim for 6th-grade level for general public)
- No unnecessary fear-mongering or false reassurance
- Clear action items and when to seek professional help
- Respect for patient autonomy and informed decision-making
- Cultural sensitivity and inclusivity

## Best Practices for Report Writing

1. **Be specific** — not "there is a problem" but "Section 3, paragraph 2 claims X, but the cited study actually found Y"
2. **Be constructive** — always pair criticism with a concrete suggestion
3. **Be balanced** — acknowledge strengths alongside weaknesses
4. **Cite your sources** — reference the guidelines or papers that inform your evaluation
5. **Consider the audience** — evaluation standards differ for professional vs. public content
6. **Stay practical** — improvement suggestions should be realistic and actionable
7. **Disclose limitations** — acknowledge what this AI-based review can and cannot verify

## Caveats

1. **Not a substitute for expert judgment** — this is an AI-based evaluation tool
2. **Full-text access is limited** — verification relies on abstracts, open-access articles, and bibliographic metadata
3. **Image evaluation is limited** — cannot deeply analyze embedded figures or video content
4. **Rapidly evolving fields** — the most current evidence may not yet be indexed
5. **Final medical decisions** should always be made by qualified healthcare professionals

## Reference Files

- `references/checklist.md` — detailed 15-item evaluation checklist
- `references/evidence-levels.md` — evidence hierarchy & quality assessment tools
- `templates/report-template.md` — structured report template

## External References

- Cochrane Handbook for Systematic Reviews of Interventions
- GRADE Working Group
- AGREE II (Appraisal of Guidelines for Research & Evaluation)
- AMSTAR 2 (A MeAsurement Tool to Assess systematic Reviews)
- CONSORT, STROBE, PRISMA reporting guidelines
- FDA / PMDA / EMA advertising and promotion regulations
- DISCERN (quality of health information for patients)
- HONcode (Health On the Net Foundation)
