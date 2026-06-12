# Changelog

All notable changes to Evidentia are documented here. This project adheres to
[Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format.

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
- **Worked examples** with real registry output, a GitHub Actions example for medical
  content repos, issue templates, and a test suite (22 unit + 5 live API tests).

### Changed

- Restructured the repository into a plugin layout (`skills/medical-fact-check/...`).
- Reference-file paths in `SKILL.md` are now relative and plugin-portable.
- README rebuilt around a one-line install, a real demo, and the citation layer.

[1.0.0]: https://github.com/kgraph57/evidentia/releases/tag/v1.0.0
