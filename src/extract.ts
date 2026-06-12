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
const YEAR_RE = /\b(19|20)\d{2}\b/;

function cleanDoi(doi: string): string {
  return doi
    .replace(/[.,;)\]]+$/, '')
    .toLowerCase();
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
  const stripped = span
    .replace(DOI_RE, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/PMID:?\s*\d+/gi, ' ')
    .replace(/arXiv:\s*\S+/gi, ' ')
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

function guessAuthors(span: string): string[] | undefined {
  // "Smith J", "Smith JA", "Smith, J.", "Smith et al"
  const matches = span.match(/\b([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*,?\s*[A-Z]{1,3}\b/g);
  if (!matches || matches.length === 0) return undefined;
  const names = matches
    .map((m) => m.replace(/\s*,?\s*[A-Z]{1,3}$/, '').trim())
    .filter((n, i, a) => a.indexOf(n) === i);
  return names.length ? names.slice(0, 6) : undefined;
}

function guessYear(span: string): number | undefined {
  const m = span.match(YEAR_RE);
  return m ? Number(m[0]) : undefined;
}

/**
 * Split text into citation-bearing spans. We treat numbered/bulleted reference
 * lines and DOI/PMID-bearing sentences as candidate spans, so the metadata we
 * attach (title/author/year) comes from the right neighbourhood.
 */
function spans(text: string): string[] {
  // If there's a references section, prefer its lines.
  const refSplit = text.split(/\n\s*(?:references|bibliography|引用文献|参考文献)\s*:?\s*\n/i);
  const body = refSplit.length > 1 ? refSplit.slice(1).join('\n') : text;
  const lines = body
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  // Numbered reference lines, or any line/sentence containing an identifier.
  const out: string[] = [];
  for (const line of lines) {
    if (/^\[?\d+[.)\]]/.test(line) || /10\.\d{4,9}\//.test(line) || /PMID|pubmed/i.test(line)) {
      out.push(line);
    } else {
      // Break long prose into sentences and keep those with identifiers.
      for (const sent of line.split(/(?<=[.!?])\s+/)) {
        if (/10\.\d{4,9}\//.test(sent) || /PMID|pubmed|arXiv/i.test(sent)) out.push(sent);
      }
    }
  }
  return out;
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
  const searchSpans = candidateSpans.length ? candidateSpans : [text];

  for (const span of searchSpans) {
    const ids: Array<{ kind: 'doi' | 'pmid' | 'arxiv'; value: string }> = [];

    for (const m of span.matchAll(DOI_RE)) ids.push({ kind: 'doi', value: cleanDoi(m[0]) });
    for (const m of span.matchAll(PMID_RE)) if (m[1]) ids.push({ kind: 'pmid', value: m[1] });
    for (const m of span.matchAll(PMID_URL_RE)) if (m[1]) ids.push({ kind: 'pmid', value: m[1] });
    for (const m of span.matchAll(ARXIV_RE)) if (m[1]) ids.push({ kind: 'arxiv', value: m[1] });

    // De-duplicate identifiers within this span.
    const uniqueIds = ids.filter(
      (id, i) => ids.findIndex((o) => o.kind === id.kind && o.value === id.value) === i,
    );
    if (uniqueIds.length === 0) continue;

    // Only attach a guessed title/author/year when the span contains exactly one
    // identifier. With several identifiers in one span (common in inline AI prose),
    // a single guessed title would bleed onto the wrong paper and fabricate a
    // mismatch, so we fall back to safe identifier-only verification.
    const attachMeta = uniqueIds.length === 1;
    const claimedTitle = attachMeta ? guessTitle(span) : undefined;
    const claimedAuthors = attachMeta ? guessAuthors(span) : undefined;
    const claimedYear = attachMeta ? guessYear(span) : undefined;

    for (const id of uniqueIds) {
      const key = `${id.kind}:${id.value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        index: ++index,
        raw: span.length > 400 ? span.slice(0, 400) + '…' : span,
        ...(id.kind === 'doi' ? { doi: id.value } : {}),
        ...(id.kind === 'pmid' ? { pmid: id.value } : {}),
        ...(id.kind === 'arxiv' ? { arxiv: id.value } : {}),
        ...(claimedTitle ? { claimedTitle } : {}),
        ...(claimedAuthors ? { claimedAuthors } : {}),
        ...(claimedYear ? { claimedYear } : {}),
      });
    }
  }

  return out;
}
