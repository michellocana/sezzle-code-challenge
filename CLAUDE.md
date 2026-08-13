# Project

Full-stack calculator built for a frontend engineer technical assessment: a Go REST API performing arithmetic, consumed by a React frontend. See `README.md` for setup, API reference, and design rationale.

## Structure

- `api/` — Go backend (gin). `handlers/` (HTTP handlers, one per operation), `utils/` (pure arithmetic, decimal-based), `models/` (JSON request/response structs).
- `web/` — React + TypeScript frontend (Vite), Tailwind CSS v4, shadcn/ui components in `src/components/ui/`. Path alias `@/*` → `web/src/*`. Vitest + React Testing Library for tests (`*.test.ts(x)` next to the file under test).
- `Makefile` — task runner for both apps (see Commands below).
- `docker-compose.yml` — runs `api` (`:8080`) + `web` (`:5173`, nginx serving the built SPA) together.

## Commands

- `make start-api` — run the backend with `air` live reload (repo-local tool dependency, not global; config in `api/.air.toml`).
- `make test-api` — `go test ./... -cover` in `api/`.
- `make start-web` — `npm run dev` in `web/` (Vite dev server, default `localhost:5173`).
- `make test-web` — `npm test` (`vitest run --coverage`) in `web/`.
- `docker compose up --build` — build and run both services in containers.

## Conventions & decisions

- Backend arithmetic uses `github.com/shopspring/decimal`, not raw `float64`, to avoid binary floating-point precision errors (e.g. `0.1 + 0.2`). Request bodies parse straight into `decimal.Decimal`; the result converts to `float64` exactly once, at the JSON response boundary.
- Request struct fields are pointers (`*decimal.Decimal`) with `binding:"required"` so a missing operand is distinguishable from an explicit `0`.
- One REST endpoint per operation (`/api/add`, `/api/subtract`, ...) rather than a single `/api/calculate` — keeps handlers small and independently testable.
- Frontend uses shadcn/ui (`npx shadcn@latest add <component>` to add new components) with Tailwind v4's Vite plugin (no `tailwind.config.js` needed).
- All arithmetic runs on the backend — the frontend (`src/components/calculator.tsx`) never computes results locally, including chained operations.
- Errors surface via `sonner` toasts, not inline UI state; a failed calculation leaves the current operands editable rather than locking the calculator.
- The calculator also responds to a global `keydown` listener (digits, `+-*/`, `.`/`,`, `Enter`/`=`, `Backspace`/`Escape`). Keyboard `Backspace` clears everything (like `AC`); the on-screen `⌫` button still deletes one character at a time — those two are intentionally different.

## Housekeeping

- Every time a change is made to `Makefile` or `package.json` (or `web/package.json`), check whether `README.md` needs updating to match.
