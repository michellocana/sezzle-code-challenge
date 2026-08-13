# Project

Full-stack calculator built for a frontend engineer technical assessment: a Go REST API performing arithmetic, consumed by a React frontend. See `README.md` for setup, API reference, and design rationale.

## Structure

- `api/` — Go backend (gin). `handlers/` (HTTP handlers, one per operation), `utils/` (pure arithmetic, decimal-based), `models/` (JSON request/response structs).
- `web/` — React + TypeScript frontend (Vite), Tailwind CSS v4, shadcn/ui components in `src/components/ui/`. Path alias `@/*` → `web/src/*`.
- `Makefile` — task runner for both apps (see Commands below).

## Commands

- `make start-api` — run the backend with `air` live reload (repo-local tool dependency, not global; config in `api/.air.toml`).
- `make test-api` — `go test ./... -cover` in `api/`.
- `make start-web` — `npm run dev` in `web/` (Vite dev server, default `localhost:5173`).

## Conventions & decisions

- Backend arithmetic uses `github.com/shopspring/decimal`, not raw `float64`, to avoid binary floating-point precision errors (e.g. `0.1 + 0.2`). Request bodies parse straight into `decimal.Decimal`; the result converts to `float64` exactly once, at the JSON response boundary.
- Request struct fields are pointers (`*decimal.Decimal`) with `binding:"required"` so a missing operand is distinguishable from an explicit `0`.
- One REST endpoint per operation (`/api/add`, `/api/subtract`, ...) rather than a single `/api/calculate` — keeps handlers small and independently testable.
- Frontend uses shadcn/ui (`npx shadcn@latest add <component>` to add new components) with Tailwind v4's Vite plugin (no `tailwind.config.js` needed).

## Housekeeping

- Every time a change is made to `Makefile` or `package.json` (or `web/package.json`), check whether `README.md` needs updating to match.
