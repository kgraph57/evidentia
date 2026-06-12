/** String-similarity helpers used by extraction and classification. */

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '') // strip combining diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'and', 'or', 'in', 'on', 'for', 'to', 'with',
  'by', 'from', 'at', 'as', 'is', 'are', 'be', 'this', 'that',
]);

function tokens(s: string): string[] {
  return normalize(s)
    .split(' ')
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/**
 * Whether a cited title is substantial enough to base a verdict on. Short prose
 * descriptions ("Vitamin D review", "a landmark vaccine trial") are unreliable
 * as title claims, so we never flag a mismatch from them — only from real,
 * specific titles (≥5 content words).
 */
export function isAssertiveTitle(title: string | undefined): boolean {
  return !!title && tokens(title).length >= 5;
}

/**
 * Methodology boilerplate that appears in thousands of titles. These words must
 * not drive a match — otherwise "A randomized controlled trial of X" matches any
 * unrelated "...: a randomized controlled trial".
 */
const BOILERPLATE = new Set([
  'randomized', 'randomised', 'controlled', 'trial', 'review', 'study', 'studies',
  'analysis', 'systematic', 'meta', 'metaanalysis', 'cohort', 'prospective',
  'retrospective', 'observational', 'double', 'blind', 'placebo', 'pilot',
  'evaluation', 'assessment', 'report', 'case', 'series',
]);

/**
 * Title similarity for matching a loosely-quoted citation title against a
 * registry record, on a 0..1 scale. Comparison runs over *discriminative*
 * tokens only (boilerplate removed), so generic phrasing cannot inflate a match.
 * A containment boost rewards a short title fully inside the real one, but only
 * when ≥3 specific tokens overlap; otherwise the score is capped below the
 * "same paper" threshold so a thin match is reported as uncertain, not confirmed.
 */
export function titleSimilarity(a: string, b: string): number {
  const sa = new Set(tokens(a).filter((t) => !BOILERPLATE.has(t)));
  const sb = new Set(tokens(b).filter((t) => !BOILERPLATE.has(t)));
  if (sa.size === 0 || sb.size === 0) return 0;

  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  const jaccard = inter / union;
  const containment = inter / Math.min(sa.size, sb.size);

  if (inter >= 3) {
    return Math.max(jaccard, 0.5 * jaccard + 0.5 * containment);
  }
  // Too few specific tokens in common to be confident: never let a thin overlap
  // reach the "same paper" band.
  return Math.min(jaccard, 0.75);
}

/** Case-insensitive surname match, tolerant of initials and accents. */
export function authorMatch(claimed: string, resolved: string): number {
  const c = normalize(claimed);
  const r = normalize(resolved);
  if (!c || !r) return 0;
  // Compare last tokens (surnames) primarily.
  const cl = c.split(' ').pop() ?? c;
  const rl = r.split(' ').pop() ?? r;
  if (cl === rl) return 1;
  if (r.includes(cl) || c.includes(rl)) return 0.8;
  return 0;
}
