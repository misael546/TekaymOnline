# Tekaym Online — Cloudflare server

Belmo is not used.

The multiplayer backend is a Cloudflare Worker with a SQLite-backed Durable Object named GameRoom. Cloudflare documents Durable Objects and WebSocket support on the Workers Free plan. The Free plan currently includes 100,000 Durable Object requests/day and 13,000 GB-s/day; SQLite-backed Durable Objects are the Free-plan storage option. Use WebSocket Hibernation for cost control.

Required Worker secrets/variables:
- GAME_VERSION = V1
- GOOGLE_CLIENT_ID = your Google OAuth client ID
- FIREBASE_PROJECT_ID = your Firebase project ID
- FIREBASE_SERVICE_ACCOUNT_JSON = full raw Firebase service account JSON

Never put the Firebase service account JSON in GitHub.

Deploy with Wrangler:
- npx wrangler login
- npx wrangler deploy worker/src/index.js --config worker/wrangler.jsonc

For GitHub Actions, add:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID

Suggested Worker URL:
https://tekaym-online-server.<your-subdomain>.workers.dev
