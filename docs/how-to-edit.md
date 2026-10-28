# How to edit the guide

All content is in `site/data/places.json`. Photos are in `site/photos/`. Save, push to GitHub, and the live site updates within a minute or two. Or ask an AI agent to do it: the instructions are in `AGENTS.md`.

## Add your own photo
1. Save it in `site/photos/`, e.g. `brasao-2.jpg`. Landscape, about 1000px wide.
2. Add it to that place's list: `"photos": ["photos/brasao.jpg", "photos/brasao-2.jpg"]`. The first photo is the cover.

## Add a rating or a last visit
On the place: `"rating": 5, "visited": "Oct 2026"`. `"rating": null` hides the stars.

## Sections and sub-categories
Defined under `sections`: Bars & Restaurants, Retail, Culture, Outdoors. Each place's `cat` is a sub-category id, e.g. `"portuguese"`, `"vintage"`, `"galleries"`. Empty sections and sub-categories are hidden, so Retail appears as soon as it has a shop.

## Key dates
Under `dates`. They show in Culture → Key dates.

## Add a place
Copy a place block, give it a new `id`, and set `lat` and `lng`: right-click the spot in Google Maps and click the numbers to copy them. Mind the commas: JSON breaks on a missing or extra one.

## Preview
Start the `porto-guide` preview, or run `npx -y http-server@14.1.1 site -p 8765 -c-1` and open http://localhost:8765.
