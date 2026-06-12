#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { verifyText } from './index.ts';
import { renderMarkdown, renderText } from './report.ts';
import type { VerifyOptions } from './types.ts';

const HELP = `evidentia — catch AI-fabricated medical citations before you publish

USAGE
  evidentia check <file|url>   Verify citations in a file or web page
  evidentia check -            Verify citations from stdin
  echo "<text>" | evidentia check -

OPTIONS
  --format <md|text|json>   Output format (default: text)
  --out <file>              Write the report to a file instead of stdout
  --mailto <email>          Contact email for the CrossRef/OpenAlex polite pool
  --fail-on-fabrication     Exit 1 if any citation is mismatch/hallucination (for CI)
  --offline                 Skip all network calls (extraction only)
  -h, --help                Show this help
  -v, --version             Show version

EXAMPLES
  evidentia check article.md
  evidentia check https://example.com/health-post --format md --out report.md
  cat draft.txt | evidentia check - --fail-on-fabrication

Tiers: ✅ Verified · ⚠️ Bibliographic mismatch · ❌ Hallucination · 🔍 Content review needed
`;

const VERSION = '1.0.0';

interface Args {
  command?: string;
  target?: string;
  format: 'md' | 'text' | 'json';
  out?: string;
  mailto?: string;
  failOnFabrication: boolean;
  offline: boolean;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    format: 'text',
    failOnFabrication: false,
    offline: false,
    help: false,
    version: false,
  };
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    switch (a) {
      case '-h':
      case '--help':
        args.help = true;
        break;
      case '-v':
      case '--version':
        args.version = true;
        break;
      case '--format':
        args.format = (argv[++i] as Args['format']) ?? 'text';
        break;
      case '--out':
        args.out = argv[++i];
        break;
      case '--mailto':
        args.mailto = argv[++i];
        break;
      case '--fail-on-fabrication':
        args.failOnFabrication = true;
        break;
      case '--offline':
        args.offline = true;
        break;
      default:
        positional.push(a);
    }
  }
  args.command = positional[0];
  args.target = positional[1];
  return args;
}

const MAX_FETCH_BYTES = 5_000_000; // cap remote bodies to bound memory and CPU
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Strip HTML to text using non-backtracking patterns. The `[^<]*(?:<(?!\/tag)…)*`
 * form avoids the catastrophic backtracking of a lazy `[\s\S]*?` on pages with
 * many unterminated `<script>` / `<style>` tokens.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[^<]*(?:<(?!\/script>)[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[^<]*(?:<(?!\/style>)[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Read a remote URL with a timeout and a hard body-size cap. */
async function fetchUrl(target: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(target, {
      signal: controller.signal,
      headers: { 'User-Agent': 'evidentia/1.0 (+https://github.com/kgraph57/evidentia)' },
    });
    if (!res.ok) throw new Error(`Failed to fetch ${target}: HTTP ${res.status}`);

    const declared = Number(res.headers.get('content-length') ?? '0');
    if (declared > MAX_FETCH_BYTES) {
      throw new Error(`Response too large (${declared} bytes; limit ${MAX_FETCH_BYTES}).`);
    }

    // Stream with a running byte cap in case Content-Length is absent or lies.
    const reader = res.body?.getReader();
    if (!reader) return (await res.text()).slice(0, MAX_FETCH_BYTES);
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_FETCH_BYTES) {
          await reader.cancel();
          throw new Error(`Response exceeded ${MAX_FETCH_BYTES} bytes.`);
        }
        chunks.push(value);
      }
    }
    const body = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
    const ct = res.headers.get('content-type') ?? '';
    return ct.includes('html') ? htmlToText(body) : body;
  } finally {
    clearTimeout(timer);
  }
}

async function readInput(target: string): Promise<string> {
  if (target === '-') {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks).toString('utf8');
  }
  if (/^https?:\/\//i.test(target)) {
    return fetchUrl(target);
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) {
    // Reject non-http(s) URL schemes (file:, ftp:, gopher:, …) outright.
    throw new Error(`Unsupported URL scheme in "${target}". Only http(s) URLs and local file paths are allowed.`);
  }
  return readFile(target, 'utf8');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) {
    process.stdout.write(`evidentia ${VERSION}\n`);
    return;
  }
  if (args.help || !args.command) {
    process.stdout.write(HELP);
    return;
  }
  if (args.command !== 'check') {
    process.stderr.write(`Unknown command: ${args.command}\n\n${HELP}`);
    process.exitCode = 2;
    return;
  }
  if (!args.target) {
    process.stderr.write('Error: provide a file, URL, or "-" for stdin.\n\n' + HELP);
    process.exitCode = 2;
    return;
  }

  let text: string;
  try {
    text = await readInput(args.target);
  } catch (err) {
    process.stderr.write(`Error reading input: ${(err as Error).message}\n`);
    process.exitCode = 1;
    return;
  }

  const opts: VerifyOptions = {
    ...(args.mailto ? { mailto: args.mailto } : {}),
    offline: args.offline,
  };

  const report = await verifyText(text, opts);

  let output: string;
  if (args.format === 'json') output = JSON.stringify(report, null, 2);
  else if (args.format === 'md') output = renderMarkdown(report);
  else output = renderText(report);

  if (args.out) {
    await writeFile(args.out, output, 'utf8');
    process.stdout.write(`Report written to ${args.out}\n`);
    process.stdout.write(renderText(report) + '\n');
  } else {
    process.stdout.write(output + '\n');
  }

  if (args.failOnFabrication) {
    const fabricated = report.counts['Bibliographic mismatch'] + report.counts.Hallucination;
    if (fabricated > 0) process.exitCode = 1;
  }
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${(err as Error).stack ?? err}\n`);
  process.exitCode = 1;
});
