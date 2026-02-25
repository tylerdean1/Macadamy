# Google Maps Platform Setup

This project uses two key types:

- Browser key: Maps JavaScript API + Places API only (public, referrer-restricted)
- Server key: Routes API + Weather API + Geocoding API + Roads API + Maps Static API (private, never exposed)

## 1) Enable Google APIs

Enable these APIs in your Google Cloud project:

- Maps JavaScript API
- Places API
- Routes API
- Weather API
- Geocoding API
- Roads API
- Maps Static API

## 2) Create two API keys

### Browser key (public)

- Name: `VITE_GOOGLE_MAPS_BROWSER_KEY`
- Application restriction: `HTTP referrers`
- Referrers: production domain(s), preview domain(s), localhost for dev
- API restrictions: only
  - Maps JavaScript API
  - Places API

### Server key (private)

- Name: `GOOGLE_MAPS_SERVER_KEY`
- Application restriction: server-side restriction (IP allowlist if available)
- API restrictions: only
  - Routes API
  - Weather API
  - Geocoding API
  - Roads API
  - Maps Static API

Do not use the server key in browser code.

## 3) Environment variables

Use `.env.example` as reference.

### Vercel variables

Set these in Vercel Project Settings -> Environment Variables:

- `VITE_GOOGLE_MAPS_BROWSER_KEY` (browser-safe)
- `VITE_APP_BASE_URL` (optional)
- `GOOGLE_MAPS_SERVER_KEY` (private)
- `SUPABASE_URL` (server runtime)
- `SUPABASE_ANON_KEY` (server runtime for JWT validation)
- `SUPABASE_SERVICE_ROLE_KEY` (optional, server-only)

### Important for this repo

Current frontend runtime reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_TOKEN`

Keep these configured for the existing app boot/auth flow.

## 4) Security checks

- Verify browser bundle does not contain `GOOGLE_MAPS_SERVER_KEY`
- Confirm static map calls go through `maps_static` Edge Function
- Confirm all maps server functions require `Authorization: Bearer <token>`
