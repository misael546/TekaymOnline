# Tekaym Online

Tekaym Online is a standalone 3D first-person multiplayer survival-horror game for the web.

## V1
- Large prison complex.
- 4 cell blocks × 16 cells = 64 cells.
- Player starts in a randomly selected open cell.
- Zombies never spawn inside protected cells.
- Knife-only starting combat.
- Health, stamina, hunger and thirst.
- PC and mobile touch controls.
- 16-player multiplayer foundation.
- Google account authentication foundation.
- Belmo WebSocket/HTTP server foundation.
- Dedicated Firebase Firestore persistence.
- One official release version only: V1.

## Separation
This repository is independent from NeonCore/DarkPixel Online.
Do not copy DarkPixel files, assets, databases or update systems into this repository.

## Deployment
GitHub Pages publishes the client.
Belmo runs only the `server/` service.
Firebase Firestore is the dedicated persistent database for Tekaym Online.

See `docs/game-design.md` and `docs/asset-sources.md` for the base design and asset policy.
