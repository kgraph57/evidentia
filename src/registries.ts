import type { ResolvedRecord, ExtractedCitation, VerifyOptions } from './types.ts';
import { titleSimilarity } from './text.ts';

const UA_BASE = 'evidentia/1.0 (https://github.com/kgraph57/evidentia)';

function userAgent(mailto?: string): string {
  return mailto ? `${UA_BASE} mailto:${mailto}` : UA_BASE;
}

/**
 * A registry was reachable-but-failing (timeout, rate limit, 5xx) or unreachable.
 * Distinct from a clean 404 "not found" (which `fetchJson` returns as `null`), so
 * callers can report "could not verify" instead of mislabelling it "fabricated".
 */
export class RegistryUnavailableError extends Error {
  override name = 'RegistryUnavailableError';
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch JSON with bounded timeout and retry. Returns parsed JSON on success,
 * `null` on a definitive 404, and throws {@link RegistryUnavailableError} when
 * the registry is rate-limited / erroring / unreachable after all retries — so a
 * single transient blip never crashes a whole verification run.
 */
async function fetchJson(url: string, opts: VerifyOptions): Promise<unknown | null> {
  if (opts.offline) return null;
  const f = opts.fetchImpl ?? fetch;
  const maxAttempts = (opts.retries ?? 2) + 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 12_000);
    try {
      const res = await f(url, {
        signal: controller.signal,
        headers: { 'User-Agent': userAgent(opts.mailto), Accept: 'application/json' },
      });
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        // Transient — fall through to retry.
        lastError = new RegistryUnavailableError(`HTTP ${res.status} for ${url}`);
      } else if (!res.ok) {
        // Other 4xx — not retryable, but still "could not verify", not "fabricated".
        throw new RegistryUnavailableError(`HTTP ${res.status} for ${url}`);
      } else {
        return await res.json();
      }
    } catch (err) {
      if (err instanceof RegistryUnavailableError && !/HTTP (429|5\d\d)/.test(err.message)) {
        throw err; // non-retryable 4xx
      }
      lastError = err; // network error or timeout abort — retry
    } finally {
      clearTimeout(timer);
    }
    if (attempt < maxAttempts - 1) await sleep(250 * (attempt + 1));
  }

  throw lastError instanceof RegistryUnavailableError
    ? lastError
    : new RegistryUnavailableError(`Request failed for ${url}: ${(lastError as Error)?.message ?? 'unknown'}`);
}

/* ----------------------------- CrossRef ----------------------------- */

interface CrossrefWork {
  title?: string[];
  author?: Array<{ family?: string; given?: string }>;
  'container-title'?: string[];
  published?: { 'date-parts'?: number[][] };
  created?: { 'date-parts'?: number[][] };
  issued?: { 'date-parts'?: number[][] };
  DOI?: string;
  URL?: string;
}

function crossrefYear(w: CrossrefWork): number | undefined {
  const parts =
    w.issued?.['date-parts']?.[0] ??
    w.published?.['date-parts']?.[0] ??
    w.created?.['date-parts']?.[0];
  return parts?.[0];
}

export async function lookupCrossrefByDoi(
  doi: string,
  opts: VerifyOptions,
): Promise<ResolvedRecord | null> {
  const data = (await fetchJson(
    `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
    opts,
  )) as { message?: CrossrefWork } | null;
  const w = data?.message;
  if (!w) return null;
  return {
    source: 'crossref',
    doi: w.DOI?.toLowerCase(),
    title: w.title?.[0],
    authors: (w.author ?? []).map((a) => [a.given, a.family].filter(Boolean).join(' ')).filter(Boolean),
    year: crossrefYear(w),
    journal: w['container-title']?.[0],
    url: w.URL,
    matchScore: 1,
  };
}

/* ------------------------------ PubMed ------------------------------ */

interface PubmedSummary {
  title?: string;
  authors?: Array<{ name?: string }>;
  source?: string;
  pubdate?: string;
  articleids?: Array<{ idtype?: string; value?: string }>;
  uid?: string;
  error?: string;
}

export async function lookupPubmedByPmid(
  pmid: string,
  opts: VerifyOptions,
): Promise<ResolvedRecord | null> {
  const data = (await fetchJson(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${encodeURIComponent(pmid)}&retmode=json`,
    opts,
  )) as { result?: Record<string, PubmedSummary> } | null;
  const rec = data?.result?.[pmid];
  if (!rec || rec.error || !rec.title) return null;
  const doi = rec.articleids?.find((a) => a.idtype === 'doi')?.value;
  const yearMatch = rec.pubdate?.match(/\b(19|20)\d{2}\b/);
  return {
    source: 'pubmed',
    pmid,
    doi: doi?.toLowerCase(),
    title: rec.title,
    authors: (rec.authors ?? []).map((a) => a.name ?? '').filter(Boolean),
    year: yearMatch ? Number(yearMatch[0]) : undefined,
    journal: rec.source,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    matchScore: 1,
  };
}

/* ------------------------------ OpenAlex ----------------------------- */

interface OpenAlexWork {
  title?: string;
  doi?: string;
  publication_year?: number;
  ids?: { pmid?: string };
  authorships?: Array<{ author?: { display_name?: string } }>;
  primary_location?: { source?: { display_name?: string } };
}

function openAlexRecord(w: OpenAlexWork, score: number): ResolvedRecord {
  return {
    source: 'openalex',
    doi: w.doi?.replace(/^https?:\/\/doi\.org\//, '').toLowerCase(),
    pmid: w.ids?.pmid?.replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//, ''),
    title: w.title,
    authors: (w.authorships ?? []).map((a) => a.author?.display_name ?? '').filter(Boolean),
    year: w.publication_year,
    journal: w.primary_location?.source?.display_name,
    url: w.doi ?? undefined,
    matchScore: score,
  };
}

export async function lookupOpenAlexByDoi(
  doi: string,
  opts: VerifyOptions,
): Promise<ResolvedRecord | null> {
  const data = (await fetchJson(
    `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}`,
    opts,
  )) as OpenAlexWork | null;
  if (!data?.title) return null;
  return openAlexRecord(data, 1);
}

/**
 * Title-only fallback: search OpenAlex and return the best title match above a
 * confidence floor. Used when a citation has no resolvable DOI/PMID but does
 * carry a title, so we can distinguish "real paper, missing identifier" from
 * "this paper does not exist".
 */
export async function searchOpenAlexByTitle(
  citation: ExtractedCitation,
  opts: VerifyOptions,
): Promise<ResolvedRecord | null> {
  const title = citation.claimedTitle;
  if (!title) return null;
  const q = encodeURIComponent(title.slice(0, 300));
  const data = (await fetchJson(
    `https://api.openalex.org/works?filter=title.search:${q}&per-page=5&mailto=${encodeURIComponent(opts.mailto ?? '')}`,
    opts,
  )) as { results?: OpenAlexWork[] } | null;
  const results = data?.results ?? [];
  let best: ResolvedRecord | null = null;
  for (const w of results) {
    if (!w.title) continue;
    const score = titleSimilarity(title, w.title);
    if (!best || score > best.matchScore) best = openAlexRecord(w, score);
  }
  // Return the best candidate only if it is at least plausibly the same paper.
  // Below this floor there is no credible match; callers treat that as "not found".
  // The caller (verify.ts) applies the finer ≥0.8 "same paper" vs 0.5–0.8
  // "uncertain → review" bands.
  return best && best.matchScore >= 0.5 ? best : null;
}
