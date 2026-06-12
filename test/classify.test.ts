import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyCitation } from '../src/verify.ts';
import type { ExtractedCitation, VerifyOptions } from '../src/types.ts';

/**
 * A deterministic fake fetch standing in for CrossRef / PubMed / OpenAlex, so
 * classification logic is tested offline without hitting the network.
 */
function fakeFetch(routes: Record<string, unknown>): typeof fetch {
  return (async (url: string | URL) => {
    // Decode so routes can match the un-encoded DOI path (CrossRef encodes the
    // slash in the DOI, e.g. 10.1%2Freal).
    const u = decodeURIComponent(String(url));
    for (const [needle, body] of Object.entries(routes)) {
      if (u.includes(needle)) {
        if (body === null) return new Response(null, { status: 404 });
        return new Response(JSON.stringify(body), { status: 200 });
      }
    }
    return new Response(null, { status: 404 });
  }) as unknown as typeof fetch;
}

const REAL_TITLE = 'Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine';

function crossrefOk(doi: string, title: string) {
  return { message: { DOI: doi, title: [title], author: [{ family: 'Polack', given: 'FP' }], 'container-title': ['N Engl J Med'], issued: { 'date-parts': [[2020]] }, URL: `https://doi.org/${doi}` } };
}

function baseCitation(over: Partial<ExtractedCitation>): ExtractedCitation {
  return { index: 1, raw: 'raw', ...over };
}

test('Tier 1 — DOI resolves and title matches', async () => {
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({ 'api.crossref.org/works/10.1/real': crossrefOk('10.1/real', REAL_TITLE) }),
  };
  const r = await verifyCitation(baseCitation({ doi: '10.1/real', claimedTitle: REAL_TITLE }), opts);
  assert.equal(r.tier.tier, 1);
  assert.equal(r.tier.label, 'Verified');
});

test('Tier 4 — DOI does not resolve and no paper matches', async () => {
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({ 'openalex.org/works?': { results: [] } }), // everything else 404
  };
  const r = await verifyCitation(baseCitation({ doi: '10.9999/fake', claimedTitle: 'A fabricated study of nothing' }), opts);
  assert.equal(r.tier.tier, 4);
  assert.equal(r.tier.label, 'Hallucination');
});

test('Tier 4 — DOI resolves to a different paper than cited', async () => {
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({ 'api.crossref.org/works/10.1/real': crossrefOk('10.1/real', REAL_TITLE) }),
  };
  const r = await verifyCitation(
    baseCitation({ doi: '10.1/real', claimedTitle: 'Unicorn cardiology in neonates: a randomized trial' }),
    opts,
  );
  assert.equal(r.tier.tier, 4);
  assert.match(r.tier.reason, /different paper/);
});

test('Tier 3 — real paper cited with an invented DOI', async () => {
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({
      // DOI 404s everywhere, but title search finds the real paper.
      'openalex.org/works?': { results: [{ title: REAL_TITLE, doi: 'https://doi.org/10.1056/nejmoa2034577', publication_year: 2020 }] },
    }),
  };
  const r = await verifyCitation(baseCitation({ doi: '10.9999/fake', claimedTitle: REAL_TITLE }), opts);
  assert.equal(r.tier.tier, 3);
  assert.equal(r.tier.label, 'Bibliographic mismatch');
});

test('Tier 3 — DOI resolves but the year is wrong', async () => {
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({ 'api.crossref.org/works/10.1/real': crossrefOk('10.1/real', REAL_TITLE) }),
  };
  const r = await verifyCitation(baseCitation({ doi: '10.1/real', claimedTitle: REAL_TITLE, claimedYear: 2015 }), opts);
  assert.equal(r.tier.tier, 3);
  assert.ok(r.discrepancies.some((d) => d.field === 'year'));
});

test('Tier 2 — offline mode never fabricates a verdict', async () => {
  const r = await verifyCitation(baseCitation({ doi: '10.1/real' }), { offline: true });
  assert.equal(r.tier.tier, 2);
  assert.equal(r.tier.label, 'Content review needed');
});

test('PMID path — invalid PMID with no title is a hallucination', async () => {
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({ 'esummary.fcgi': { result: { '99999999': { error: 'cannot get document summary' } } }, 'openalex.org/works?': { results: [] } }),
  };
  const r = await verifyCitation(baseCitation({ pmid: '99999999' }), opts);
  assert.equal(r.tier.tier, 4);
});

/* ---- Regression tests for the QA-review must-fix findings ---- */

/** A fetch that always returns a given HTTP status (for failure-path tests). */
function statusFetch(status: number): typeof fetch {
  return (async () => new Response(status === 404 ? null : '{}', { status })) as unknown as typeof fetch;
}

test('CRITICAL — a real paper with a mid-band title match is NEVER a hallucination', async () => {
  // Identifier-free citation; OpenAlex returns a partially-matching real title
  // (similarity lands in the 0.5–0.8 band). Must be Tier 2, not Tier 4.
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({
      'openalex.org/works?': { results: [{ title: 'Aspirin for primary prevention of cardiovascular events', publication_year: 2018 }] },
    }),
  };
  const r = await verifyCitation(
    baseCitation({ claimedTitle: 'Aspirin for primary prevention of cardiovascular disease in diabetes' }),
    opts,
  );
  assert.notEqual(r.tier.tier, 4); // the bug would have made this a hallucination
  assert.equal(r.tier.tier, 2);
});

test('CRITICAL — a transient 500 from a registry never crashes; citation becomes Tier 2', async () => {
  const opts: VerifyOptions = { fetchImpl: statusFetch(500), retries: 0 };
  const r = await verifyCitation(baseCitation({ doi: '10.1/real', claimedTitle: REAL_TITLE }), opts);
  assert.equal(r.tier.tier, 2);
  assert.match(r.tier.reason, /unavailable|could not/i);
});

test('a 429 rate-limit is also surfaced as Tier 2, not a crash or a fake verdict', async () => {
  const opts: VerifyOptions = { fetchImpl: statusFetch(429), retries: 0 };
  const r = await verifyCitation(baseCitation({ pmid: '33301246' }), opts);
  assert.equal(r.tier.tier, 2);
});

test('NCT — a registered trial verifies (Tier 1)', async () => {
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({
      'clinicaltrials.gov/api/v2/studies/NCT04280705': {
        protocolSection: {
          identificationModule: { nctId: 'NCT04280705', briefTitle: 'ACTT-1' },
          statusModule: { startDateStruct: { date: '2020-02-21' } },
        },
      },
    }),
  };
  const r = await verifyCitation(baseCitation({ nct: 'NCT04280705' }), opts);
  assert.equal(r.tier.tier, 1);
});

test('NCT — an unregistered trial id is a hallucination (Tier 4)', async () => {
  const opts: VerifyOptions = { fetchImpl: fakeFetch({}) }; // everything 404s
  const r = await verifyCitation(baseCitation({ nct: 'NCT09999999' }), opts);
  assert.equal(r.tier.tier, 4);
  assert.match(r.tier.reason, /ClinicalTrials\.gov/);
});

test('ISBN — a book citation is Tier 2, never a hallucination', async () => {
  const r = await verifyCitation(baseCitation({ isbn: '9780323529501' }), { offline: false, fetchImpl: fakeFetch({}) });
  assert.equal(r.tier.tier, 2);
  assert.match(r.tier.reason, /[Bb]ook/);
});

test('CRITICAL — an unindexed guideline (title-only, not found) is Tier 2, NOT a hallucination', async () => {
  // Title search finds nothing; the old behavior wrongly called this a fabrication.
  const opts: VerifyOptions = { fetchImpl: fakeFetch({ 'openalex.org/works?': { results: [] } }) };
  const r = await verifyCitation(
    baseCitation({ claimedTitle: 'WHO recommendations on antenatal care for a positive pregnancy experience' }),
    opts,
  );
  assert.notEqual(r.tier.tier, 4);
  assert.equal(r.tier.tier, 2);
  assert.match(r.tier.reason, /grey literature|guideline|not found in the indexed/i);
});

test('a fabricated DOI on a generic title is softened to Tier 2, not falsely "verified"', async () => {
  // DOI 404s; title search returns a boilerplate-similar paper below the 0.8 floor.
  const opts: VerifyOptions = {
    fetchImpl: fakeFetch({
      'openalex.org/works?': { results: [{ title: 'Vitamin D supplementation: a randomized controlled trial', publication_year: 2017 }] },
    }),
  };
  const r = await verifyCitation(
    baseCitation({ doi: '10.9999/fake', claimedTitle: 'A randomized controlled trial of vitamin D' }),
    opts,
  );
  assert.notEqual(r.tier.tier, 1);
  assert.ok(r.tier.tier === 2 || r.tier.tier === 4, `expected Tier 2 or 4, got ${r.tier.tier}`);
});
