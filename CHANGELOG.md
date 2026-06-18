# Changelog

All notable changes to Evidentia are documented here. This project adheres to
[Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format.

## [1.1.0] — 2026-06-18

### Added

- **arXiv verification**: arXiv IDs now resolve against the arXiv API instead of
  always falling back to manual review.
- **Agent-readable resolver traces**: JSON results now include `lookupVerified` and
  `resolverOutcomes`, exposing matched / unmatched / unreachable / skipped registry
  outcomes without changing the human-facing 4-tier verdict.
- **Optional local registry cache**: `--cache <file>` for the CLI, `cachePath` for MCP,
  and `VerifyOptions.cachePath` for library callers.
- **Codex Desktop plugin metadata** via `.codex-plugin/plugin.json` and
  `.agents/plugins/marketplace.json`.
- **Benchmark expansion** from 19 to 22 cases, adding arXiv and ISBN manual-review
  coverage.

### Changed

- Hardened TypeScript type resolution with `types: ["node"]` so stray copied
  `node_modules/@types/*` folders do not break local builds.
- Updated README, Japanese README, plugin metadata, and package metadata for arXiv,
  resolver traces, local cache, and Codex plugin installation.

## [1.0.0] — 2026-06-12

First public release. Evidentia becomes a tool, not just a prompt.

### Added

- **Deterministic citation-verification engine** (`evidentia` npm package): extracts
  DOIs/PMIDs/arXiv IDs from any text and resolves them against CrossRef, PubMed, and
  OpenAlex — no API key required.
- **4-tier classification**: Verified / Bibliographic mismatch / Hallucination /
  Content-review-needed, distinguishing *"real paper, wrong DOI"* from *"this paper does
  not exist"* via title fallback search.
- **CLI**: `evidentia check <file|url|->` with `--format md|text|json`, `--out`,
  `--mailto`, `--offline`, and `--fail-on-fabrication` (CI exit code).
- **MCP server** (`evidentia-mcp`): exposes `verify_citations` to any MCP-capable agent;
  install with `claude mcp add evidentia -- npx -y evidentia-mcp`.
- **Claude Code plugin packaging**: `.claude-plugin/plugin.json` and `marketplace.json`,
  installable via `/plugin marketplace add kgraph57/evidentia`.
- **Skill integration**: the 15-criteria appraisal skill now calls the engine for Step 4
  citation verification, using its output as ground truth for citation existence.
- **Clinical-trial verification**: recognizes ClinicalTrials.gov **NCT** IDs and resolves
  them against the registry (real → Verified, unregistered → Hallucination).
- **Book & grey-literature awareness**: an **ISBN**, a clinical guideline, or any source not
  indexed in these registries is marked *"verify manually"* (Tier 2) — never a false
  hallucination. Identifier-less entries in a reference list are surfaced, not skipped.
- **Batch input**: `evidentia check a.md b.md …` verifies multiple files and prints an
  aggregate report; `--fail-on-fabrication` considers all of them (used by the CI example).
- **Worked examples** with real registry output, a GitHub Actions example for medical
  content repos, issue templates, a 17-case live benchmark, and a test suite
  (38 unit + 5 live API tests).

### Changed

- Restructured the repository into a plugin layout (`skills/medical-fact-check/...`).
- Reference-file paths in `SKILL.md` are now relative and plugin-portable.
- README rebuilt around a one-line install, a real demo, and the citation layer.

[1.1.0]: https://github.com/kgraph57/evidentia/releases/tag/v1.1.0
[1.0.0]: https://github.com/kgraph57/evidentia/releases/tag/v1.0.0
