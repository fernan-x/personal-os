# Personal OS

## Stack
- **Monorepo**: pnpm 10 workspaces
- **API**: NestJS 11 (SWC) on port 3001, `/api` prefix
- **Web**: React 19 + Vite + SWC on port 5173, proxy to API
- **UI**: Mantine v7 + Tailwind CSS v4
- **Routing**: React Router v7 (library mode, `createBrowserRouter`)
- **DB**: PostgreSQL + Prisma 6
- **Lang**: TypeScript 5.7 strict, `verbatimModuleSyntax`
- **Test**: Vitest
- **Lint**: ESLint 9 flat config

## Workspace Layout
```
apps/api          @personal-os/api       NestJS API
apps/web          @personal-os/web       React SPA
packages/database @personal-os/database  Prisma schema + client
packages/domain   @personal-os/domain    Pure TS types + validation
packages/ui       @personal-os/ui        Shared React components
packages/config/  Shared tsconfig + eslint configs
```

## Commands
```bash
pnpm dev            # Run API + Web in parallel
pnpm dev:api        # NestJS watch mode
pnpm dev:web        # Vite dev server
pnpm build          # Build all packages
pnpm test           # Vitest across workspace
pnpm lint           # ESLint across workspace
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations (dev)
pnpm db:push        # Push schema to DB
pnpm db:studio      # Prisma Studio
```

## Docker
```bash
docker compose up              # Dev: PostgreSQL + API (hot-reload) + Web (hot-reload)
docker compose up --build      # Dev: rebuild images then start
docker compose down            # Stop all dev containers
docker compose down -v         # Stop and remove volumes (reset DB)

docker compose -f docker-compose.prod.yml up --build   # Prod: built API + nginx SPA
docker compose -f docker-compose.prod.yml down          # Stop prod containers
```

## Conventions
- Domain logic lives in `packages/domain` (pure TS, zero runtime deps)
- Database access goes through `DatabaseService` (NestJS) or `prisma` singleton
- Shared UI components in `packages/ui`, app-specific in `apps/web/src/`
- Validation functions return `ValidationError[]` — empty = valid
- API controllers are thin; business logic in services
- NestJS uses CommonJS (`node.json` tsconfig); everything else uses ESM

## Guiding Principle
Ship small, working increments. Every module should be buildable and testable independently.
