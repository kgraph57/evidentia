import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { VerifyOptions } from './types.ts';

const DEFAULT_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export interface CachedHttpResponse {
  status: number;
  body: string | null;
}

interface CacheFile {
  version: 1;
  entries: Record<string, CachedHttpResponse & { timestamp: number }>;
}

async function readCacheFile(path: string): Promise<CacheFile> {
  try {
    const raw = await readFile(path, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CacheFile>;
    return { version: 1, entries: parsed.entries ?? {} };
  } catch {
    return { version: 1, entries: {} };
  }
}

export async function readHttpCache(
  opts: VerifyOptions,
  key: string,
): Promise<CachedHttpResponse | undefined> {
  if (!opts.cachePath) return undefined;
  const cache = await readCacheFile(opts.cachePath);
  const hit = cache.entries[key];
  if (!hit) return undefined;
  const ttl = opts.cacheTtlMs ?? DEFAULT_TTL_MS;
  if (Date.now() - hit.timestamp > ttl) return undefined;
  return { status: hit.status, body: hit.body };
}

export async function writeHttpCache(
  opts: VerifyOptions,
  key: string,
  value: CachedHttpResponse,
): Promise<void> {
  if (!opts.cachePath) return;
  const cache = await readCacheFile(opts.cachePath);
  cache.entries[key] = { ...value, timestamp: Date.now() };
  await mkdir(dirname(opts.cachePath), { recursive: true });
  const tempPath = `${opts.cachePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, JSON.stringify(cache, null, 2), 'utf8');
  await rename(tempPath, opts.cachePath);
}
