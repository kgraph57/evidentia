import type { VerifyReport, VerifiedCitation, TierInfo } from './types.ts';

const TIER_EMOJI: Record<TierInfo['label'], string> = {
  Verified: '✅',
  'Content review needed': '🔍',
  'Bibliographic mismatch': '⚠️',
  Hallucination: '❌',
};

function citationId(c: VerifiedCitation): string {
  if (c.doi) return `doi:${c.doi}`;
  if (c.pmid) return `pmid:${c.pmid}`;
  if (c.arxiv) return `arXiv:${c.arxiv}`;
  if (c.nct) return c.nct;
  if (c.isbn) return `ISBN:${c.isbn}`;
  return c.claimedTitle ?? '(no identifier)';
}

/** Render the verification result as a Markdown report. */
export function renderMarkdown(report: VerifyReport): string {
  const { counts, fabricationRate, totalCitations } = report;
  const lines: string[] = [];

  lines.push('# Evidentia — Citation Verification Report');
  lines.push('');
  lines.push(`_Generated ${report.generatedAt}_`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Citations checked:** ${totalCitations}`);
  lines.push(`- ✅ Verified: ${counts.Verified}`);
  lines.push(`- ⚠️ Bibliographic mismatch: ${counts['Bibliographic mismatch']}`);
  lines.push(`- ❌ Hallucination: ${counts.Hallucination}`);
  lines.push(`- 🔍 Content review needed: ${counts['Content review needed']}`);
  lines.push(`- **Fabrication rate:** ${(fabricationRate * 100).toFixed(1)}% (mismatch + hallucination)`);
  lines.push('');

  const flagged = report.citations.filter((c) => c.tier.tier >= 3);
  if (flagged.length) {
    lines.push('## 🚩 Flagged citations');
    lines.push('');
    for (const c of flagged) {
      lines.push(`### ${TIER_EMOJI[c.tier.label]} [${c.index}] ${citationId(c)}`);
      lines.push('');
      lines.push(`- **Verdict:** Tier ${c.tier.tier} — ${c.tier.label}`);
      lines.push(`- **Why:** ${c.tier.reason}`);
      if (c.claimedTitle) lines.push(`- **Cited as:** ${c.claimedTitle}`);
      if (c.resolved?.title) lines.push(`- **Registry record:** ${c.resolved.title} (${c.resolved.source})`);
      if (c.resolved?.url) lines.push(`- **Link:** ${c.resolved.url}`);
      for (const d of c.discrepancies) {
        lines.push(`  - \`${d.field}\` — cited: _${d.claimed}_ · record: _${d.resolved}_`);
      }
      lines.push('');
    }
  }

  lines.push('## All citations');
  lines.push('');
  lines.push('| # | Identifier | Verdict | Registry |');
  lines.push('|---|------------|---------|----------|');
  for (const c of report.citations) {
    const idstr = citationId(c).replace(/\|/g, '\\|');
    const reg = c.resolved?.source ?? '—';
    lines.push(`| ${c.index} | ${idstr} | ${TIER_EMOJI[c.tier.label]} T${c.tier.tier} ${c.tier.label} | ${reg} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('> Evidentia checks citation **existence and bibliographic accuracy** deterministically.');
  lines.push('> Whether a real citation is used in the right **context** (Tier 2) needs semantic review —');
  lines.push('> run the [Evidentia skill](https://github.com/kgraph57/evidentia) in Claude Code for the full 15-criteria appraisal.');
  lines.push('');

  return lines.join('\n');
}

/** Compact one-line-per-citation output for terminals and CI logs. */
export function renderText(report: VerifyReport): string {
  const lines: string[] = [];
  lines.push(`Evidentia: ${report.totalCitations} citations — ` +
    `${report.counts.Verified} verified, ` +
    `${report.counts['Bibliographic mismatch']} mismatch, ` +
    `${report.counts.Hallucination} hallucinated ` +
    `(${(report.fabricationRate * 100).toFixed(1)}% fabrication rate)`);
  for (const c of report.citations) {
    const mark =
      c.tier.tier === 1 ? 'OK ' : c.tier.tier === 2 ? '?? ' : c.tier.tier === 3 ? 'MIS' : 'HAL';
    lines.push(`  [${mark}] ${citationId(c)} — ${c.tier.reason}`);
  }
  return lines.join('\n');
}
