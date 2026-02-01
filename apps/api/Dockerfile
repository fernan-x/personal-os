# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/config/typescript/package.json packages/config/typescript/package.json
COPY packages/config/eslint/package.json packages/config/eslint/package.json
# Web package.json needed for workspace resolution
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY . .
RUN pnpm --filter @personal-os/database db:generate
RUN pnpm --filter @personal-os/api build

# ---- Dev (used by docker-compose.yml) ----
FROM deps AS dev
COPY . .
RUN pnpm --filter @personal-os/database db:generate
EXPOSE 3001
CMD ["pnpm", "dev:api"]

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/packages/database ./packages/database
COPY --from=build /app/packages/domain ./packages/domain
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

EXPOSE 3001
WORKDIR /app/apps/api
CMD ["node", "dist/main"]
