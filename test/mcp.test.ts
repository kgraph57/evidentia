import { spawn } from 'node:child_process';
import { dirname, resolve as resolvePath } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

interface McpResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: {
    content?: Array<{ type: string; text: string }>;
    isError?: boolean;
  };
}

function callMcp(message: object): Promise<McpResponse> {
  return new Promise((resolve, reject) => {
    const testDir = dirname(fileURLToPath(import.meta.url));
    const mcpPath = resolvePath(testDir, '../src/mcp.js');
    const child = spawn(process.execPath, [mcpPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
      const line = stdout.split('\n').find(Boolean);
      if (line) {
        child.kill();
        resolve(JSON.parse(line) as McpResponse);
      }
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (!stdout.trim()) reject(new Error(`MCP exited with ${code}: ${stderr}`));
    });
    child.stdin.end(JSON.stringify(message) + '\n');
  });
}

test('MCP rejects calls to an unknown tool name', async () => {
  const response = await callMcp({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: 'not_evidentia', arguments: {} },
  });
  assert.equal(response.result?.isError, true);
  assert.match(response.result?.content?.[0]?.text ?? '', /Unknown tool/);
});
