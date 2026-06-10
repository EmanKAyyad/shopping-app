# Shopping App API

A REST API for a shopping application, built with [NestJS](https://nestjs.com/) 11
and TypeScript. The project ships with a clean, layered, feature-oriented
architecture and runs out of the box with **no external services** (data is held in
in-memory stores until you wire up a real database).

> Working on this codebase with an AI assistant? Read **[CLAUDE.md](./CLAUDE.md)** —
> it documents the architecture and the rules every change must follow.

## Requirements

- Node.js 20+
- npm 10+

## Getting started

```bash
npm install
cp .env.example .env        # already done on first setup
npm run start:dev
```

- API base URL: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`
- Health check: `GET http://localhost:3000/api/v1/health`

## Scripts

| Task             | Command              |
| ---------------- | -------------------- |
| Run (watch)      | `npm run start:dev`  |
| Run (prod build) | `npm run start:prod` |
| Build            | `npm run build`      |
| Lint (autofix)   | `npm run lint`       |
| Format           | `npm run format`     |
| Unit tests       | `npm test`           |
| E2E tests        | `npm run test:e2e`   |
| Coverage         | `npm run test:cov`   |

## Project structure

```
src/
├── main.ts            # Bootstrap: global pipes, filters, interceptors, Swagger
├── app.module.ts      # Root module
├── config/            # Typed configuration & env validation
├── common/            # Cross-cutting: filters, interceptors, decorators, dto, base entity
├── database/          # Persistence wiring (ORM goes here)
└── modules/           # Feature modules: health, auth, users, categories,
                       #   products, cart, orders
```

`modules/products` is the **reference module** — it is fully implemented (CRUD,
pagination, filtering, validation, unit + e2e tests). The other domain modules are
placeholders ready to be built out following the same blueprint. See
[CLAUDE.md](./CLAUDE.md) for the full architecture and conventions.

## Key conventions

- **Layered, feature-first** layout — cross-cutting code in `common/`, business
  domains in `modules/<feature>/`.
- **Validated DTOs everywhere** via `class-validator`; unknown fields are rejected.
- **Consistent envelopes** — every success response is wrapped as
  `{ success, data, meta?, path, timestamp }`; every error shares a matching shape.
- **Typed config** — environment variables are validated at boot (fail-fast) and read
  through `ConfigService`, never `process.env` directly.
- **OpenAPI** docs generated from decorators, served at `/docs`.

## Configuration

All environment variables are documented in [`.env.example`](./.env.example) and
validated on startup by `src/config/env.validation.ts`. The app fails fast with a
descriptive error if the configuration is invalid.

## Example requests

```bash
# Create a product
curl -X POST http://localhost:3000/api/v1/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Aeron Chair","description":"Ergonomic chair","price":119900,"sku":"CHR-001","stock":50}'

# List products (paginated & filterable)
curl "http://localhost:3000/api/v1/products?page=1&limit=20&search=chair"
```

## Adding a feature

```bash
npx nest g resource modules/<feature>
```

Then reshape it into the module blueprint and register it in `app.module.ts`. The
full checklist is in [CLAUDE.md](./CLAUDE.md).
