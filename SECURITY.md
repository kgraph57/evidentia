# Security Policy

## Reporting a vulnerability

If you find a security issue — for example, a way to make the CLI or MCP server execute
unintended code, leak data, or make requests to unintended hosts — please **do not open a
public issue**. Instead, use GitHub's [private vulnerability reporting](https://github.com/kgraph57/evidentia/security/advisories/new)
or email the maintainer at the address in `package.json`.

You can expect an acknowledgement within 7 days.

## Scope and threat model

Evidentia is a local tool. It:

- reads files and URLs you point it at,
- sends extracted **identifiers and titles** (not full documents) to three public
  registries — CrossRef, PubMed, and OpenAlex — over HTTPS,
- writes a report to stdout or a file you specify.

It does **not** require or store credentials, and the engine makes no LLM calls. The MCP
server speaks JSON-RPC over stdio only.

### Things to be aware of

- **URL input** (`evidentia check https://…`) makes an outbound request to that URL. Only
  check URLs you trust, the same as any fetch tool.
- **Registry requests** transmit the DOIs, PMIDs, and citation titles found in your text to
  CrossRef/PubMed/OpenAlex. If your document is confidential, run with `--offline` (extraction
  only, no network) or review what would be sent first.

## Supported versions

The latest `1.x` release receives security fixes.
