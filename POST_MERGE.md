# Post-merge checklist

Do these on the kgraph57/evidentia repo after the landing files are on main.

## GitHub Pages

1. Settings, then Pages
2. Source: Deploy from a branch
3. Branch: main / folder: /docs
4. Save
5. Confirm the site: https://kgraph57.github.io/evidentia/
6. Confirm Japanese: https://kgraph57.github.io/evidentia/ja/

docs/.nojekyll is present so Pages will not run Jekyll.

## Repository homepage

1. About, then the gear
2. Website: https://kgraph57.github.io/evidentia/
3. Save

## Topics

Set these exact topics (About, then gear, then topics):

medical
fact-check
citation
hallucination
claude-code
claude-skills
mcp
pubmed
doi

## Quick sanity

- EN hero and CLI demo render without a CDN
- JA toggle (/ja/) loads CSS from ../site/css/
- npx evidentia check examples/inputs/ai-generated-answer.md still matches the demo on the site
- README lead link matches the live Pages URL
- Do not quote star counts until they are real
