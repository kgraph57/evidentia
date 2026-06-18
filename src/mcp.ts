#!/usr/bin/env node
/**
 * Minimal MCP stdio server exposing Evidentia's citation verification as a tool.
 *
 * Implements the Model Context Protocol over newline-delimited JSON-RPC 2.0
 * (stdio transport) with zero runtime dependencies. Install in Claude Code with:
 *
 *   claude mcp add evidentia -- npx -y evidentia-mcp
 */
import { createInterface } from 'node:readline';
import { verifyText } from './index.ts';
import { renderMarkdown } from './report.ts';
import type { VerifyOptions } from './types.ts';

const SERVER = { name: 'evidentia', version: '1.1.0' };
const SUPPORTED_PROTOCOL = '2025-06-18';

interface RpcRequest {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

function send(msg: object): void {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function result(id: RpcRequest['id'], res: unknown): void {
  send({ jsonrpc: '2.0', id, result: res });
}

function error(id: RpcRequest['id'], code: number, message: string): void {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

const TOOL = {
  name: 'verify_citations',
  description:
    'Verify medical/scientific citations in a block of text against CrossRef, PubMed, and OpenAlex. ' +
    'Detects fabricated DOIs, invalid PMIDs, arXiv IDs, and bibliographic mismatches, returning a 4-tier classification ' +
    '(Verified / Bibliographic mismatch / Hallucination / Content review needed) plus a fabrication rate.',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'The text containing citations to verify.' },
      mailto: { type: 'string', description: 'Optional contact email for the CrossRef/OpenAlex polite pool.' },
      cachePath: { type: 'string', description: 'Optional local JSON cache path for registry HTTP responses.' },
      format: { type: 'string', enum: ['markdown', 'json'], description: 'Output format (default markdown).' },
    },
    required: ['text'],
  },
};

async function handleToolCall(params: Record<string, unknown> | undefined): Promise<{ content: object[] }> {
  if (params?.name !== TOOL.name) {
    throw new Error(`Unknown tool: ${String(params?.name ?? '(missing)')}`);
  }
  const args = (params?.arguments ?? {}) as { text?: string; mailto?: string; cachePath?: string; format?: string };
  if (typeof args.text !== 'string' || !args.text.trim()) {
    throw new Error('Missing required argument: text');
  }
  const opts: VerifyOptions = {
    ...(args.mailto ? { mailto: args.mailto } : {}),
    ...(args.cachePath ? { cachePath: args.cachePath } : {}),
  };
  const report = await verifyText(args.text, opts);
  const body = args.format === 'json' ? JSON.stringify(report, null, 2) : renderMarkdown(report);
  return { content: [{ type: 'text', text: body }] };
}

async function dispatch(req: RpcRequest): Promise<void> {
  switch (req.method) {
    case 'initialize':
      result(req.id, {
        protocolVersion:
          (req.params?.protocolVersion as string) || SUPPORTED_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
      return;
    case 'notifications/initialized':
      return; // notification, no response
    case 'ping':
      result(req.id, {});
      return;
    case 'tools/list':
      result(req.id, { tools: [TOOL] });
      return;
    case 'tools/call':
      try {
        const res = await handleToolCall(req.params);
        result(req.id, res);
      } catch (err) {
        // Tool errors are reported in-band so the model can react.
        result(req.id, {
          content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
          isError: true,
        });
      }
      return;
    default:
      if (req.id !== undefined && req.id !== null) {
        error(req.id, -32601, `Method not found: ${req.method}`);
      }
  }
}

function main(): void {
  const rl = createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let req: RpcRequest;
    try {
      req = JSON.parse(trimmed) as RpcRequest;
    } catch {
      error(null, -32700, 'Parse error');
      return;
    }
    void dispatch(req);
  });
}

main();
