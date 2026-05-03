# burrow-ui

Next.js frontend for [Burrow](https://burrow.in) — verified flatmate finder for Gurgaon. This repo is **standalone** (not a monorepo); the API lives in a sibling directory `../burrow-api/`.

## Spec and contract (read before building flows)

- Product and env expectations: symlink `00_BURROW_MASTER_SPEC.md` → `../burrow-api/BURROW_MASTER_SPEC.md` (or open that file in `burrow-api`).
- Endpoints and error shapes: symlink `API_CONTRACT.md` → `../burrow-api/API_CONTRACT.md`.
- Visual source of truth: `design/*.html` (inline React reference — re-implement in Tailwind, do not copy inline styles).

## Setup

```bash
pnpm install
ln -sf ../burrow-api/API_CONTRACT.md API_CONTRACT.md
ln -sf ../burrow-api/BURROW_MASTER_SPEC.md 00_BURROW_MASTER_SPEC.md
cp .env.local.example .env.local
pnpm exec playwright install chromium   # once, for e2e
pnpm dev
```

App: [http://localhost:3000](http://localhost:3000) · API (local): [http://localhost:4000/api/v1](http://localhost:4000/api/v1)

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Next dev server |
| `pnpm build` / `pnpm start` | Production build and run |
| `pnpm lint` / `pnpm typecheck` | ESLint (flat `eslint.config.mjs` via `ESLINT_USE_FLAT_CONFIG`) and `tsc --noEmit` |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest |
| `pnpm test:e2e` | Playwright |
| `pnpm sync-from-api` | Copy `../burrow-api/src/common/constants.ts` → `src/lib/constants.ts` with sync timestamp |

## Structure

- `src/app/` — App Router; `(auth)` and `(app)` route groups; `/` is the design system showcase (remove before launch).
- `src/components/ui|brand|layout|states/` — primitives and shells.
- `src/lib/api` — `ApiClient`, `GET /auth/me` hook (`useCurrentUser`).
- `src/providers/` — `next-themes`, TanStack Query.

## License

Private / all rights reserved unless otherwise stated.
