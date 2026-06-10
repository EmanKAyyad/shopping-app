# CLAUDE.md

Guidance for working in this repository. These are **rules**, not suggestions —
follow them so the codebase stays consistent.

## Project

NestJS 11 (TypeScript, Express) REST API for a shopping application. Node.js 20+.
The persistence layer is intentionally stubbed (in-memory stores) so the app runs
with zero external services; swap in a real ORM later without touching controllers.

## Commands

| Task              | Command              |
| ----------------- | -------------------- |
| Install           | `npm install`        |
| Run (watch)       | `npm run start:dev`  |
| Run (prod build)  | `npm run start:prod` |
| Build             | `npm run build`      |
| Lint (autofix)    | `npm run lint`       |
| Format            | `npm run format`     |
| Unit tests        | `npm test`           |
| E2E tests         | `npm run test:e2e`   |
| Coverage          | `npm run test:cov`   |

- API base URL: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`
- Always run `npm run lint` and `npm test` before considering a change done.

## Architecture & folder classification

Code is organised by **layer first, then by feature**. Cross-cutting concerns live
under `common/`; the business domain lives under `modules/`.

```
src/
├── main.ts                  # Bootstrap: global pipes, filters, interceptors, Swagger
├── app.module.ts            # Root module — wires config, database, feature modules
│
├── config/                  # Typed configuration & env validation (no business logic)
│   ├── configuration.ts     # Nested, typed config object (never read process.env elsewhere)
│   ├── env.validation.ts    # Fail-fast env schema (class-validator)
│   └── index.ts             # Barrel
│
├── common/                  # Cross-cutting, framework-level building blocks (no domain logic)
│   ├── decorators/          # Custom decorators (e.g. @Public())
│   ├── dto/                 # Shared DTOs (e.g. PaginationQueryDto)
│   ├── entities/            # Shared base classes (BaseEntity)
│   ├── filters/             # Exception filters (global error envelope)
│   ├── guards/              # Shared guards
│   ├── interceptors/        # Transform (response envelope) + logging
│   ├── interfaces/          # Shared TS types/interfaces
│   ├── pipes/               # Custom pipes
│   └── index.ts             # Barrel
│
├── database/                # Persistence wiring (global module; ORM goes here)
│
└── modules/                 # Feature (domain) modules — one folder per bounded context
    ├── health/              # Liveness/readiness probes
    ├── auth/                # Authentication & authorization
    ├── users/               # Accounts / customers
    ├── categories/          # Product taxonomy
    ├── products/            # ⭐ Reference module — copy this structure
    ├── cart/                # Shopping cart
    └── orders/              # Checkout & order history
```

### Anatomy of a feature module (the `products` blueprint)

Every feature module MUST follow this internal structure:

```
modules/<feature>/
├── <feature>.module.ts          # Declares controllers/providers; exports its service
├── <feature>.controller.ts      # HTTP layer only — no business logic
├── <feature>.service.ts         # Business logic; the only place that touches the store
├── <feature>.service.spec.ts    # Unit tests co-located with the service
├── dto/                         # Request/response DTOs (validated)
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts  # PartialType(Create…) from @nestjs/swagger
│   └── query-<feature>.dto.ts   # extends PaginationQueryDto
└── entities/                    # Domain models (extend BaseEntity)
    └── <feature>.entity.ts
```

When you build out a placeholder module, scaffold with the CLI then move files into
this layout: `npx nest g resource modules/<feature> --no-spec=false`.

## Coding rules

### Modules

- One feature = one module under `modules/`. Keep bounded contexts independent.
- A module **exports its service** if other modules need it; cross-module access goes
  through the exported service, never by importing another module's internals.
- Register infrastructure (config, database) as `@Global()` so features don't re-import it.

### Controllers

- Controllers are thin: parse/validate input, call the service, return the result.
  **No business logic, no data access in controllers.**
- Validate every path param that is an id with `ParseUUIDPipe`.
- Annotate routes for Swagger (`@ApiTags`, `@ApiOperation`, response decorators).
- Public (unauthenticated) routes are marked with `@Public()`.

### Services

- All business logic and data access live in services. Services are the unit-test seam.
- Throw Nest HTTP exceptions (`NotFoundException`, `ConflictException`, …) — never
  return error objects or raw status codes. The global filter formats them.

### DTOs & validation

- Every request body/query is a class-based DTO using `class-validator` decorators.
- The global `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted`, and
  `transform: true` — unknown properties are rejected, so keep DTOs complete.
- Use `@Type()` / `@Transform()` for any non-string input (numbers, booleans, dates).
- Extend `PaginationQueryDto` for list endpoints instead of redefining `page`/`limit`.
- Build update DTOs with `PartialType()` from `@nestjs/swagger` (keeps docs + rules).

### Entities

- Domain entities extend `common/entities/BaseEntity` (gives `id`, `createdAt`,
  `updatedAt`, `touch()`).
- Entities are plain classes today; when an ORM is added, decorate them in place.

### Configuration

- Never read `process.env` outside `config/`. Inject `ConfigService` and read the
  typed namespaces (`config.getOrThrow<AppConfig>('app')`).
- Add a new env var in **three** places: `env.validation.ts` (schema),
  `configuration.ts` (typed mapping), and `.env.example` (documentation).

### Responses & errors

- Success responses are auto-wrapped by `TransformInterceptor` into
  `{ success, data, meta?, path, timestamp }`. Return plain data/`{ items, meta }`
  from handlers — do not build the envelope yourself.
- Errors are auto-wrapped by `AllExceptionsFilter` into a matching error envelope.

### Imports

- Use relative imports (no path aliases) so the default `tsc` build resolves at
  runtime without extra tooling.
- Import shared building blocks from the barrels (`../../common`, `../../config`)
  rather than deep file paths where a barrel exists.

### TypeScript & style

- Prettier + ESLint (typescript-eslint) are authoritative; run `npm run lint`.
- Prefer explicit return types on public service/controller methods.
- No `any`. Type external/untyped payloads (e.g. cast `res.body` in tests).

## Testing rules

- Co-locate unit tests as `*.spec.ts` next to the service under test.
- E2E tests live in `test/` and hit the real HTTP stack via `supertest`.
- Every new service method gets a unit test; every new endpoint gets an e2e test.
- Tests must not depend on external services (the in-memory stores keep them hermetic).

## Adding a new feature — checklist

1. `npx nest g resource modules/<feature>` (REST, with tests).
2. Reshape into the blueprint above (`dto/`, `entities/`, co-located spec).
3. Entity extends `BaseEntity`; DTOs validated; list DTO extends `PaginationQueryDto`.
4. Service holds the logic and throws Nest exceptions; controller stays thin.
5. Register the module in `app.module.ts` under "Feature (domain) modules".
6. Add Swagger annotations; mark public routes with `@Public()`.
7. `npm run lint && npm test && npm run test:e2e` — all green before done.
