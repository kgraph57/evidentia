# Evidentia

A comprehensive medical fact-checking skill for [Claude Code](https://claude.ai/claude-code).

Evaluates medical information across 15 criteria — evidence levels, citation accuracy, statistical interpretation, ethical considerations, and more — then generates a structured Markdown report with an overall A–F score and actionable improvement suggestions.

> **日本語での概要:** 医学情報のファクトチェックと批評的評価を行う Claude Code スキルです。論文・記事・SNS投稿・患者向け資料など、あらゆる医学情報を15項目で包括的に評価し、構造化レポートを生成します。

## Features

- **15-item evaluation framework** — covers evidence quality, citation accuracy, statistics, causation, bias, ethics, and more
- **AI hallucination detection** — cross-references DOIs against actual publications to catch fabricated citations (4-tier classification)
- **Structured report generation** — produces a Markdown report with an A–F overall score, per-item ratings, and concrete fix suggestions
- **Post-correction re-verification** — re-evaluates articles after edits to confirm issues are resolved (Step 9)
- **Multi-format support** — works with research papers, blog posts, social media, newsletters, and patient-facing materials

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

Each item is rated **Excellent / Good / Fair / Poor** (優/良/可/不可). The overall score is derived as follows:

| Score | Criteria |
|-------|----------|
| **A** | 12+ Excellent, 0 Poor |
| **B** | 12+ Excellent or Good, ≤1 Poor |
| **C** | 12+ Fair or better, ≤2 Poor |
| **D** | 3+ Poor |
| **F** | 5+ Poor, or critical ethical issues |

## Installation

### Prerequisites

- [Claude Code](https://claude.ai/claude-code) installed

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

That's it. The skill is automatically loaded by Claude Code.

## Usage

Trigger the skill in Claude Code chat with phrases like:

```
Fact-check this article
```

```
Check the evidence in this post
```

> **日本語トリガー例:** 「ファクトチェックして」「エビデンスチェック」「この記事を評価して」「この投稿の問題点を教えて」

### Input formats

- **Text** — paste directly into chat
- **File** — provide a path to a Markdown/text file
- **URL** — the skill uses WebFetch to retrieve and evaluate web articles

### Output

A structured Markdown report is saved to the working directory:

```
medical-fact-check-report-YYYY-MM-DD.md
```

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

1. **Acquire & analyze** — identify content type, audience, main claims
2. **Load checklist** — read the 15-item evaluation criteria
3. **Assess evidence levels** — apply GRADE methodology where applicable
4. **Verify citations** — search DOI/PMID, cross-check against originals, detect hallucinations
5. **Detailed evaluation** — rate each of the 15 items (Excellent/Good/Fair/Poor)
6. **Determine overall score** — aggregate item ratings into A–F
7. **Generate report** — produce structured Markdown from the template
8. **Deliver report** — save file and summarize findings
9. **Post-correction re-verification** *(optional)* — re-evaluate after article revisions

## File Structure

```
evidentia/
├── SKILL.md                    # Main skill definition (9-step workflow)
├── references/
│   ├── checklist.md            # Detailed 15-item evaluation checklist
│   └── evidence-levels.md      # Evidence hierarchy & quality assessment tools
└── templates/
    └── report-template.md      # Report template (8 sections)
```

## Customization

### Evaluation criteria

Edit `references/checklist.md` to add domain-specific check items (e.g., oncology-specific criteria, drug interaction checks).

### Report format

Edit `templates/report-template.md` to modify section structure or add custom sections.

### Evidence levels

Edit `references/evidence-levels.md` to add specialty-specific assessment standards (e.g., pediatrics, cardiology).

## Limitations

- This is an AI-based evaluation and **does not replace expert medical judgment**
- Full-text review of cited papers is limited to what is accessible via web search (abstracts, open-access articles, bibliographic metadata)
- Image and figure evaluation is limited
- Final medical decisions should always be made by qualified healthcare professionals

> **免責事項:** 本スキルはAIによる評価であり、医療専門家の判断を代替するものではありません。最終的な医学的判断は資格を持つ医療従事者が行ってください。

## Contributing

Bug reports and feature requests are welcome via [Issues](https://github.com/kgraph57/evidentia/issues).

## License

[MIT License](LICENSE)
