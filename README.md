# Evidentia

A comprehensive medical fact-checking skill for [Claude Code](https://claude.ai/claude-code).

Evaluates any medical content — research papers, news articles, social media posts, YouTube/podcast transcripts, conference slides, clinical guidelines, pharma marketing, patient leaflets, AI-generated text, and more — across 15 criteria, then generates a structured Markdown report with an overall A–F score and actionable improvement suggestions.

> **日本語での概要:** 医学情報のファクトチェックと批評的評価を行う Claude Code スキルです。論文・記事・SNS投稿・動画/ポッドキャスト・学会スライド・診療ガイドライン・製薬マーケティング資料・患者向けリーフレット・AI生成コンテンツなど、あらゆる医学情報を15項目で包括的に評価し、構造化レポートを生成します。

## Features

- **15-item evaluation framework** — covers evidence quality, citation accuracy, statistics, causation, bias, ethics, and more
- **AI hallucination detection** — cross-references DOIs against actual publications to catch fabricated citations (4-tier classification)
- **12 media types supported** — research papers, news, social media, video/podcast transcripts, slides, guidelines, marketing, patient materials, AI-generated content, textbooks, infographics, health apps
- **Media-adaptive evaluation** — automatically adjusts evaluation criteria weights based on content type
- **Public health risk assessment** — flags content with LOW / MEDIUM / HIGH misinformation risk
- **Structured report generation** — produces a Markdown report with an A–F overall score, per-item ratings, and concrete fix suggestions
- **Post-correction re-verification** — re-evaluates articles after edits to confirm issues are resolved (Step 9)
- **Multi-language support** — evaluates content in its original language

## Supported Media Types

| Category | Examples | Key Focus |
|----------|----------|-----------|
| Research papers | Journal articles, preprints, systematic reviews | Evidence level, methodology, statistical rigor |
| News & articles | Health news, medical blogs, magazine articles | Accuracy of claims, source attribution, exaggeration |
| Social media | X (Twitter), Instagram, TikTok, Reddit, note | Brevity-induced omissions, clickbait, misinformation risk |
| Newsletters | Email newsletters, Substack, medical columns | Citation completeness, audience calibration |
| Patient materials | Leaflets, brochures, hospital handouts | Readability, completeness, fear-mongering |
| Video/audio transcripts | YouTube, podcasts, webinar transcripts | Verbal exaggeration, missing nuance, source attribution |
| Presentations | Conference slides, lecture materials, grand rounds | Slide oversimplification, citation on slides |
| Clinical guidelines | Practice guidelines, protocols, algorithms | AGREE II compliance, evidence grading, COI |
| Marketing materials | Pharma ads, device brochures, supplement claims | Regulatory compliance, selective data, COI |
| Health apps & digital | App descriptions, chatbot outputs, AI-generated content | Hallucination detection, accuracy of automated advice |
| Textbooks & education | Textbook chapters, CME/CPD materials | Currency, completeness, pedagogical accuracy |
| Infographics | Visual summaries, data visualizations, social cards | Data integrity, oversimplification, source attribution |

## Evaluation Criteria

| # | Item | Description |
|---|------|-------------|
| 1 | Evidence level & study design | Quality of RCTs, meta-analyses, observational studies |
| 2 | Citation & source accuracy | DOI cross-check, hallucination detection |
| 3 | Statistical interpretation | Relative vs. absolute risk, p-values, effect sizes |
| 4 | Causation vs. correlation | Validity of causal claims |
| 5 | Bias & conflicts of interest | COI disclosure, publication bias |
| 6 | Exaggeration & overclaiming | Clickbait, overgeneralization |
| 7 | Target population fit | Match between study population and audience |
| 8 | Temporal validity | Currency of information, guideline alignment |
| 9 | Jargon–readability balance | Terminology appropriate for the target audience |
| 10 | Ethical considerations | Stigma avoidance, fear-mongering detection |
| 11 | Logical consistency | Coherence between claims and evidence |
| 12 | Images & figures | Data visualization integrity and sourcing |
| 13 | Alternative explanations | Balanced presentation of competing viewpoints |
| 14 | Clinical relevance | Real-world applicability and significance |
| 15 | Information completeness | Coverage of risks, benefits, and alternatives |

## Scoring

Each item is rated **Excellent / Good / Fair / Poor**. The overall score is derived as follows:

| Score | Criteria |
|-------|----------|
| **A** | 12+ Excellent, 0 Poor |
| **B** | 12+ Excellent or Good, ≤1 Poor |
| **C** | 12+ Fair or better, ≤2 Poor |
| **D** | 3+ Poor |
| **F** | 5+ Poor, or critical ethical issues |

## Installation

### Prerequisites

- [Claude Code](https://claude.ai/claude-code) installed and working

### Setup

```bash
# 1. Clone this repository
git clone https://github.com/kgraph57/evidentia.git

# 2. Copy to Claude Code skills directory
mkdir -p ~/.claude/skills/medical-fact-check
cp -r evidentia/SKILL.md ~/.claude/skills/medical-fact-check/
cp -r evidentia/references ~/.claude/skills/medical-fact-check/
cp -r evidentia/templates ~/.claude/skills/medical-fact-check/
```

That's it. Claude Code automatically discovers skills in `~/.claude/skills/`.

## How to Use (Invocation)

The skill activates automatically when Claude Code detects a fact-checking intent. There are several ways to invoke it:

### Trigger Phrases (English)

Type any of these in the Claude Code chat:

```
Fact-check this article
```

```
Check the evidence in this post
```

```
Evaluate this medical content
```

```
Is this health claim accurate?
```

> **日本語トリガー例:** 「ファクトチェックして」「エビデンスチェック」「この記事を評価して」「この投稿の問題点を教えて」「この医学情報を確認して」

### Input Methods

You can provide content in several ways:

**1. Paste text directly**
```
Fact-check this article:

[paste your article text here]
```

**2. Provide a file path**
```
Fact-check this file: ~/Documents/my-article.md
```

**3. Provide a URL**
```
Fact-check this: https://example.com/health-article
```

**4. Provide a video/podcast transcript**
```
Fact-check this YouTube transcript: [paste transcript]
```

### Output

A structured Markdown report is saved to the working directory:

```
medical-fact-check-report-YYYY-MM-DD.md
```

The report includes:
- Overall A–F score and public health risk level
- Per-item ratings with specific issues and suggestions
- Citation verification results (4-tier classification)
- Before/after correction examples
- References used during evaluation

### Post-Correction Re-Check (Step 9)

After fixing issues, ask Claude Code to re-evaluate:

```
Re-check the corrected article: ~/Documents/my-article-v2.md
```

The updated report is saved with a `-rev2` suffix.

## AI Hallucination Detection

A key feature of Evidentia is its ability to detect fabricated citations commonly found in AI-generated medical content.

Citations are classified into 4 tiers:

| Tier | Description |
|------|-------------|
| **Verified** | Paper exists and content matches the citation |
| **Content mismatch** | Paper exists but is cited out of context |
| **Bibliographic mismatch** | Paper exists but DOI, author, or journal info is wrong |
| **Hallucination** | DOI points to an unrelated paper, or the paper does not exist at all |

> Rather than stopping at "could not verify," the skill actively cross-references DOIs to determine whether a citation is merely unverifiable or provably fabricated.

## Workflow (9 Steps)

1. **Acquire & analyze** — identify content type, media format, audience, main claims, public health risk level
2. **Load checklist** — read the 15-item evaluation criteria
3. **Assess evidence levels** — apply GRADE methodology where applicable
4. **Verify citations** — search DOI/PMID, cross-check against originals, detect hallucinations
5. **Detailed evaluation** — rate each of the 15 items with media-specific adjustments
6. **Determine overall score** — aggregate item ratings into A–F, assign risk level
7. **Generate report** — produce structured Markdown from the template
8. **Deliver report** — save file and summarize findings
9. **Post-correction re-verification** *(optional)* — re-evaluate after article revisions

## File Structure

```
evidentia/
├── SKILL.md                    # Main skill definition (9-step workflow + media-specific handling)
├── references/
│   ├── checklist.md            # Detailed 15-item evaluation checklist with media-specific notes
│   └── evidence-levels.md      # Evidence hierarchy, GRADE, & quality assessment tools
└── templates/
    └── report-template.md      # Report template (9 sections incl. citation verification)
```

## Customization

### Evaluation criteria

Edit `references/checklist.md` to add domain-specific check items (e.g., oncology-specific criteria, drug interaction checks).

### Report format

Edit `templates/report-template.md` to modify section structure or add custom sections.

### Evidence levels

Edit `references/evidence-levels.md` to add specialty-specific assessment standards (e.g., pediatrics, cardiology, emergency medicine, mental health).

## Limitations

- This is an AI-based evaluation and **does not replace expert medical judgment**
- Full-text review of cited papers is limited to what is accessible via web search (abstracts, open-access articles, bibliographic metadata)
- Image, video, and audio evaluation is limited to text-based analysis (transcripts, captions)
- Rapidly evolving fields may have evidence not yet indexed
- Final medical decisions should always be made by qualified healthcare professionals

> **免責事項:** 本スキルはAIによる評価であり、医療専門家の判断を代替するものではありません。最終的な医学的判断は資格を持つ医療従事者が行ってください。

## Contributing

Bug reports and feature requests are welcome via [Issues](https://github.com/kgraph57/evidentia/issues).

## License

[MIT License](LICENSE)
