# SOBRI Porto guide

**Live:** https://guide.sobri.pt/

An interactive Porto city guide for guests of the SOBRI Cork House. It replaces the Word document we used to send before each stay with something guests can actually use on the street: a map, a list sorted by distance from the house, and our own photos and short reviews for each place.

## What guests get

- **List and Map views**, built for the phone. On mobile they switch, so neither one is cramped.
- **Sections and sub-categories**: Bars & Restaurants (Portuguese, fish, snacks, world food, wine bars, to dance…), Retail, Culture (museums, galleries, Port wine cellars, key dates like São João) and Outdoors.
- **Neighbourhoods**: a short guide to each area, coloured on the map from OpenStreetMap boundaries (Centro Histórico, Ribeira, Baixa, Cedofeita, Boavista, Bonfim, Campanhã, Foz, Foz Velha, Matosinhos, Afurada, Canidelo).
- **Services**: parking, luggage lockers, laundry and repairs near the house.
- **Walking distance from the house** on every place, and "nearest first" sorting.
- **Our own voice**: why we like each place, with practical details (address, phone, website).
- A dark "SOBRI" look: graphite with a cork-grain texture and a cork accent, to match the house.

## How it's built

| | |
|---|---|
| App | One static `index.html`, no build step and no framework. Vanilla JavaScript |
| Map | Leaflet 1.9.4 with OpenStreetMap tiles, darkened with a CSS filter |
| Content | `site/data/places.json`, separate from the code so anyone, or an AI agent, can edit the guide without touching the app |
| Hosting | A Cloudflare Worker serving static files. Every push to `main` publishes automatically |
| AI workflow | Built and maintained with Claude Code. `AGENTS.md` gives any AI coding tool the rules, so the guide can be updated by asking |

## Run it locally

```bash
npx -y http-server@14.1.1 site -p 8765 -c-1
```

Then open http://localhost:8765. How to add places, photos and ratings: [docs/how-to-edit.md](docs/how-to-edit.md).

## Next

- More places, including Retail (fashion, design, vintage).
- "This week in Porto": events from Viral Agenda, and events at the places in the guide.
