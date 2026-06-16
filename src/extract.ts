import type { ExtractedCitation } from './types.ts';

/**
 * DOI grammar per CrossRef's recommended regex, case-insensitive. We trim a few
 * trailing characters that commonly leak in from prose (closing brackets, dots,
 * commas) since a DOI never legitimately ends in them.
 */
const DOI_RE = /\b10\.\d{4,9}\/[-._;()/:a-z0-9A-Z]+/g;
// PMIDs are 1–8 digits, unpadded; anchor against surrounding digits so a longer
// number is not silently truncated to a valid-looking PMID.
const PMID_RE = /\bPMID:?\s*(\d{1,8})(?!\d)/gi;
const PMID_URL_RE = /pubmed\.ncbi\.nlm\.nih\.gov\/(\d{1,8})(?!\d)/gi;
const ARXIV_RE = /\barXiv:\s*(\d{4}\.\d{4,5})(v\d+)?\b/gi;
// ClinicalTrials.gov registration IDs: "NCT" followed by 8 digits.
const NCT_RE = /\bNCT(\d{8})\b/gi;
// ISBN-10 or ISBN-13, with optional dashes/spaces.
const ISBN_RE = /\bISBN(?:-1[03])?:?\s*((?:97[89][\d\s-]{10,16}|[\dxX][\d\sxX-]{8,15}))\b/gi;
const YEAR_RE = /\b(19|20)\d{2}\b/;

function cleanIsbn(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase();
}

function cleanDoi(doi: string): string {
  return doi
    .replace(/[.,;)\]]+$/, '')
    .toLowerCase();
}

function stripIdentifiers(span: string): string {
  return span
    .replace(DOI_RE, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/PMID:?\s*\d+/gi, ' ')
    .replace(/arXiv:\s*\S+/gi, ' ')
    .replace(/\bNCT\d{8}\b/gi, ' ')
    .replace(ISBN_RE, ' ');
}

/**
 * Pull a plausible title out of the citation span. A quoted run wins outright;
 * otherwise we strip identifiers and pick the longest period-delimited segment
 * that reads like a title (≥4 words, contains a real content word). This works
 * for both APA ("Author (2020). Title.") and Vancouver ("Author. Title. Journal.
 * Year.") ordering. Returns undefined when nothing looks title-like.
 */
function guessTitle(span: string): string | undefined {
  const quoted = span.match(/["'“”„«»]([^"'“”„«»]{12,})["'“”„«»]/);
  if (quoted?.[1]) return quoted[1].trim().replace(/[.;,]+$/, '');

  // Remove identifiers, URLs, and leading reference numbering.
  const stripped = stripIdentifiers(span)
    .replace(/^\s*\[?\d+[.)\]]\s*/, '');

  let best: string | undefined;
  for (const seg of stripped.split(/\.\s+/)) {
    const frag = seg.trim().replace(/[.;,]+$/, '');
    const words = frag.split(/\s+/).filter(Boolean);
    if (words.length < 4) continue;
    if (/^(?:19|20)\d{2}$/.test(frag)) continue;
    // Skip author-list / venue segments: "et al", or ≥2 bare-initial tokens
    // ("Polack FP, Thomas SJ" → FP, SJ; "N Engl J Med" → N, J).
    if (/\bet\s+al\b/i.test(frag)) continue;
    const initials = words.filter((w) => /^[A-Z]{1,3}$/.test(w)).length;
    if (initials >= 2) continue;
    // Require a real content word (≥4 letters, contains a lowercase) so a bare
    // identifier fragment is not mistaken for a title.
    const hasContentWord = words.some(
      (w) => /[a-z]/.test(w) && w.replace(/[^a-zA-Z]/g, '').length >= 4,
    );
    if (!hasContentWord) continue;
    if (!best || frag.length > best.length) best = frag;
  }
  return best && best.length >= 12 ? best : undefined;
}

function guessAuthors(span: string, claimedTitle?: string): string[] | undefined {
  let authorSpan = span;
  if (claimedTitle) {
    const titleAt = span.toLowerCase().indexOf(claimedTitle.toLowerCase());
    if (titleAt >= 0) authorSpan = span.slice(0, titleAt);
  }
  // "Smith J", "Smith JA", "Smith, J.", "Smith et al"
  const matches = authorSpan.match(/\b([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*,?\s*[A-Z]{1,3}\b/g);
  if (!matches || matches.length === 0) return undefined;
  const names = matches
    .map((m) => m.replace(/\s*,?\s*[A-Z]{1,3}$/, '').trim())
    .filter((n, i, a) => a.indexOf(n) === i);
  return names.length ? names.slice(0, 6) : undefined;
}

function guessYear(span: string): number | undefined {
  const m = stripIdentifiers(span).match(YEAR_RE);
  return m ? Number(m[0]) : undefined;
}

interface Span {
  text: string;
  /** True when the span came from an explicit "References" section, where every
   *  line is a citation even without a machine-checkable identifier. */
  fromRefList: boolean;
}

const HAS_ID = /10\.\d{4,9}\/|PMID|pubmed|arXiv|\bNCT\d{8}\b|\bISBN/i;
const REF_SECTION_RE = /(?:^|\n)\s*(?:references|bibliography|引用文献|参考文献)\s*:?\s*\n/i;

/**
 * Split text into citation-bearing spans. Inside an explicit references section
 * every line is a citation (so an unindexed guideline or book is surfaced, not
 * silently skipped); elsewhere only numbered lines and identifier-bearing
 * sentences qualify.
 */
function spansFromText(text: string, fromRefList: boolean): Span[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const out: Span[] = [];
  for (const line of lines) {
    if (fromRefList) {
      // Every non-trivial line in a references section is a citation.
      if (line.length >= 8) out.push({ text: line, fromRefList: true });
    } else if (/^\[?\d+[.)\]]/.test(line) || HAS_ID.test(line)) {
      out.push({ text: line, fromRefList: false });
    } else {
      for (const sent of line.split(/(?<=[.!?])\s+/)) {
        if (HAS_ID.test(sent)) out.push({ text: sent, fromRefList: false });
      }
    }
  }
  return out;
}

function spans(text: string): Span[] {
  const refSplit = text.split(REF_SECTION_RE);
  if (refSplit.length === 1) return spansFromText(text, false);

  const beforeReferences = refSplit[0] ?? '';
  const references = refSplit.slice(1).join('\n');
  return [
    ...spansFromText(beforeReferences, false),
    ...spansFromText(references, true),
  ];
}

/**
 * Extract every citation-like reference from free text. Each unique identifier
 * (DOI, PMID, arXiv) yields one citation; the surrounding span supplies the
 * claimed title/authors/year/journal used later to detect bibliographic
 * mismatches.
 */
export function extractCitations(text: string): ExtractedCitation[] {
  const seen = new Set<string>();
  const out: ExtractedCitation[] = [];
  let index = 0;

  const candidateSpans = spans(text);
  // Fall back to the whole text if span detection found nothing.
  const searchSpans: Span[] = candidateSpans.length
    ? candidateSpans
    : [{ text, fromRefList: false }];

  for (const span of searchSpans) {
    const s = span.text;
    const ids: Array<{ kind: 'doi' | 'pmid' | 'arxiv' | 'nct' | 'isbn'; value: string }> = [];

    for (const m of s.matchAll(DOI_RE)) ids.push({ kind: 'doi', value: cleanDoi(m[0]) });
    for (const m of s.matchAll(PMID_RE)) if (m[1]) ids.push({ kind: 'pmid', value: m[1] });
    for (const m of s.matchAll(PMID_URL_RE)) if (m[1]) ids.push({ kind: 'pmid', value: m[1] });
    for (const m of s.matchAll(ARXIV_RE)) if (m[1]) ids.push({ kind: 'arxiv', value: m[1] });
    for (const m of s.matchAll(NCT_RE)) ids.push({ kind: 'nct', value: `NCT${m[1]}` });
    for (const m of s.matchAll(ISBN_RE)) if (m[1]) ids.push({ kind: 'isbn', value: cleanIsbn(m[1]) });

    // De-duplicate identifiers within this span.
    const uniqueIds = ids.filter(
      (id, i) => ids.findIndex((o) => o.kind === id.kind && o.value === id.value) === i,
    );
    const raw = s.length > 400 ? s.slice(0, 400) + '…' : s;

    if (uniqueIds.length === 0) {
      // A reference-list line with no machine-checkable identifier (e.g. a
      // guideline, book, or website). Surface it as a title-only citation so it
      // is flagged for review rather than silently skipped.
      if (!span.fromRefList) continue;
      const title = guessTitle(s) ?? stripLeadingNumber(s);
      const key = `title:${title.toLowerCase()}`;
      if (!title || title.length < 8 || seen.has(key)) continue;
      seen.add(key);
      const year = guessYear(s);
      out.push({ index: ++index, raw, claimedTitle: title, ...(year ? { claimedYear: year } : {}) });
      continue;
    }

    // Only attach a guessed title/author/year when the span contains exactly one
    // identifier. With several identifiers in one span (common in inline AI prose),
    // a single guessed title would bleed onto the wrong paper and fabricate a
    // mismatch, so we fall back to safe identifier-only verification.
    const attachMeta = uniqueIds.length === 1;
    const claimedTitle = attachMeta ? guessTitle(s) : undefined;
    const claimedAuthors = attachMeta ? guessAuthors(s, claimedTitle) : undefined;
    const claimedYear = attachMeta ? guessYear(s) : undefined;

    for (const id of uniqueIds) {
      const key = `${id.kind}:${id.value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        index: ++index,
        raw,
        ...(id.kind === 'doi' ? { doi: id.value } : {}),
        ...(id.kind === 'pmid' ? { pmid: id.value } : {}),
        ...(id.kind === 'arxiv' ? { arxiv: id.value } : {}),
        ...(id.kind === 'nct' ? { nct: id.value } : {}),
        ...(id.kind === 'isbn' ? { isbn: id.value } : {}),
        ...(claimedTitle ? { claimedTitle } : {}),
        ...(claimedAuthors ? { claimedAuthors } : {}),
        ...(claimedYear ? { claimedYear } : {}),
      });
    }
  }

  return out;
}

/** Strip a leading reference number ("1.", "[3]") from a line. */
function stripLeadingNumber(line: string): string {
  return line.replace(/^\s*\[?\d+[.)\]]\s*/, '').trim();
}
