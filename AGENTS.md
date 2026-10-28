# SOBRI Porto guide: instructions for AI agents

An interactive Porto city guide for guests of the SOBRI Cork House, an apartment on Rua do Almada. A static site: a map and a list of places with photos, short reviews and practical details. No build step, no framework.

The project's context and decisions (the why) live in David's private Claude OS, `Projects/Sobri/Context.md`. Do not copy anything from it into this public repo.

## Layout

| Path | What |
|---|---|
| `site/index.html` | The whole app: layout, styles, map (Leaflet 1.9.4 with OpenStreetMap tiles) and logic. Rarely needs changes |
| `site/data/places.json` | All content: welcome text, sections and sub-categories, key dates, the places, more ideas. Most edits happen here |
| `site/photos/<id>.jpg` | One or more photos per place, named after its `id`. About 1000px wide, landscape |
| `docs/how-to-edit.md` | How to add a place, a photo, a rating, a section or a key date |
| `wrangler.jsonc` | Cloudflare Worker config. Everything in `site/` is published |
| `scripts/publish.ps1` | Manual publish, only if automatic publishing is down |

## Run locally

Use the `porto-guide` preview in `.claude/launch.json`, or run `npx -y http-server@14.1.1 site -p 8765 -c-1`, then open http://localhost:8765. Opening `index.html` as a file does not work, because the page fetches `data/places.json`.

## Publish

Push to `main`. Cloudflare Workers Builds deploys `site/` to the Worker `sobri-porto-guide`. Live at https://sobri-porto-guide.david-asobrinho.workers.dev/.

## Rules

- Keep `places.json` valid JSON. Each place needs `id, cat, name, tagline, photos, rating, visited, review, address, phone, lat, lng`. `cat` must be a sub-category id defined under `sections`.
- Get coordinates from the venue's address and check them on the map. Nominatim needs a User-Agent and one request per second.
- Before adding or keeping a place, check it is still open.
- Reviews are David's voice: short, warm, practical. No invented ratings: leave `rating: null` unless David gives one.
- No secrets in this repo. The Cloudflare token lives only in the Windows user variable `CLOUDFLARE_API_TOKEN` and in Cloudflare.
- Check any visual change at phone width (375px) and desktop, in both List and Map views.
