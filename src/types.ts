/**
 * Shared types for the Evidentia citation-verification engine.
 *
 * The engine performs *deterministic existence and bibliographic* verification
 * (does the cited paper exist, and does the claimed metadata match the real
 * record?). Semantic "is this citation used in the right context?" checks
 * require an LLM and are handled by the Evidentia skill, not this library.
 */

/** A reference as extracted from the source text, before verification. */
export interface ExtractedCitation {
  /** 1-based index in order of appearance. */
  index: number;
  /** The raw text span the citation was extracted from. */
  raw: string;
  /** Normalized DOI (lowercased, no URL prefix), if one was found. */
  doi?: string;
  /** PubMed ID, if one was found. */
  pmid?: string;
  /** arXiv ID, if one was found. */
  arxiv?: string;
  /** ClinicalTrials.gov registration ID (e.g. NCT04280705), if one was found. */
  nct?: string;
  /** ISBN (dashes stripped), if one was found — signals a book citation. */
  isbn?: string;
  /** A best-effort title pulled from the surrounding text, if present. */
  claimedTitle?: string;
  /** Author surnames mentioned near the citation, if any. */
  claimedAuthors?: string[];
  /** Year mentioned near the citation, if any. */
  claimedYear?: number;
  /** Journal/venue string mentioned near the citation, if any. */
  claimedJournal?: string;
}

/** The bibliographic record a registry returned for a lookup. */
export interface ResolvedRecord {
  source: 'crossref' | 'pubmed' | 'openalex' | 'clinicaltrials' | 'arxiv';
  doi?: string;
  pmid?: string;
  nct?: string;
  arxiv?: string;
  title?: string;
  authors?: string[];
  year?: number;
  journal?: string;
  url?: string;
  /** 0..1 confidence that this record matches the extracted citation. */
  matchScore: number;
}

export type Tier = 1 | 2 | 3 | 4;

export type LookupVerified = 'true' | 'false' | 'unresolvable';

export type ResolverStatus = 'matched' | 'unmatched' | 'unreachable' | 'skipped';

export type ResolverQuery = 'id' | 'title' | null;

export interface ResolverOutcome {
  status: ResolverStatus;
  queriedBy: ResolverQuery;
  responseSummary?: string;
}

export interface TierInfo {
  tier: Tier;
  label: 'Verified' | 'Content review needed' | 'Bibliographic mismatch' | 'Hallucination';
  /** One-line, human-readable rationale. */
  reason: string;
}

/** The full result for one citation after verification + classification. */
export interface VerifiedCitation extends ExtractedCitation {
  resolved?: ResolvedRecord;
  /** ARS-style 3-state existence signal used by agents and CI. */
  lookupVerified: LookupVerified;
  /** Per-registry trace of what was attempted and how it resolved. */
  resolverOutcomes: Record<string, ResolverOutcome>;
  tier: TierInfo;
  /** Field-level disagreements between claimed and resolved metadata. */
  discrepancies: Discrepancy[];
}

export interface Discrepancy {
  field: 'title' | 'author' | 'year' | 'journal' | 'doi';
  claimed: string;
  resolved: string;
  /** 0..1 similarity; lower means a bigger disagreement. */
  similarity: number;
}

export interface VerifyOptions {
  /** Contact email sent to CrossRef/OpenAlex for the polite pool. */
  mailto?: string;
  /** Per-request timeout in ms. */
  timeoutMs?: number;
  /** Retry count for transient registry failures (429/5xx/timeout). Default 2. */
  retries?: number;
  /** Disable network calls (used in offline tests). */
  offline?: boolean;
  /** Optional persistent HTTP cache path for registry lookups. */
  cachePath?: string;
  /** Cache TTL in ms. Default 90 days. */
  cacheTtlMs?: number;
  /** Injectable fetch for testing. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

export interface VerifyReport {
  generatedAt: string;
  totalCitations: number;
  counts: Record<TierInfo['label'], number>;
  /** Headline fabrication rate: (tier 3 + tier 4) / total, 0..1. */
  fabricationRate: number;
  citations: VerifiedCitation[];
}
