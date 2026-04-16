# korea-trip

Personal itinerary PWA for a 15-day South Korea trip (May 8–22, 2026). Seoul + Busan, ~45 places. Glassmorphism UI, Hebrew-default with English toggle, swipe between days, check-off, inline edits, live opening-hours check via Google Places, offline-capable PWA.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS · Framer Motion · React Router · Zustand · react-i18next · @dnd-kit · vite-plugin-pwa · zod.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run preview
```

To test Netlify Functions locally, run `netlify dev` instead of `npm run dev`.

## Deploy

Push to Netlify (config already in `netlify.toml`). To enable the "Check live hours" button, add a `GOOGLE_PLACES_API_KEY` env var in Netlify → Site settings → Environment variables (requires the new Places API enabled in Google Cloud).

Itinerary data lives in `src/data/trip.seed.json`. User edits + check-offs persist to localStorage via an overlay — the seed stays pristine.
