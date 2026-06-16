import { spawn } from 'node:child_process';
import { dirname, resolve as resolvePath } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function runCli(args: string[], input = ''): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const testDir = dirname(fileURLToPath(import.meta.url));
    const cliPath = resolvePath(testDir, '../src/cli.js');
    const child = spawn(
      process.execPath,
      [cliPath, ...args],
      { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.stdin.end(input);
  });
}

test('CLI rejects an unsupported --format value', async () => {
  const result = await runCli(['check', '-', '--format', 'yaml', '--offline'], 'doi:10.1000/x');
  assert.equal(result.code, 2);
  assert.match(result.stderr, /Invalid --format/);
  assert.equal(result.stdout, '');
});

test('CLI rejects an unknown option before reading targets', async () => {
  const result = await runCli(['check', '--bogus', '-', '--offline'], 'doi:10.1000/x');
  assert.equal(result.code, 2);
  assert.match(result.stderr, /Unknown option: --bogus/);
  assert.doesNotMatch(result.stderr, /Error reading --bogus/);
});

test('CLI rejects an unknown option even without a command', async () => {
  const result = await runCli(['--bogus']);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /Unknown option: --bogus/);
});

test('CLI rejects --out without a file path', async () => {
  const result = await runCli(['check', '-', '--offline', '--out'], 'doi:10.1000/x');
  assert.equal(result.code, 2);
  assert.match(result.stderr, /Missing value for --out/);
  assert.equal(result.stdout, '');
});
