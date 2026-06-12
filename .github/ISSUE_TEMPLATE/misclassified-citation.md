---
name: Misclassified citation
about: Evidentia gave the wrong verdict for a citation (false positive or false negative)
title: "[misclassified] "
labels: misclassification
---

**The citation text** (paste the exact line/reference Evidentia read):

```
<paste here>
```

**The verdict Evidentia gave:**
- [ ] ✅ Verified
- [ ] ⚠️ Bibliographic mismatch
- [ ] ❌ Hallucination
- [ ] 🔍 Content review needed

**The verdict you expected, and why:**
<e.g. "This is a real paper — DOI 10.xxxx/yyyy resolves to it — but it was flagged as a hallucination.">

**Command used:**
```
npx evidentia check ... 
```

**Evidentia version:** <output of `npx evidentia --version`>

**Anything else** (the real DOI/PMID, a link to the paper, the citation style):
