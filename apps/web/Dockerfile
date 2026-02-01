# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/config/typescript/package.json packages/config/typescript/package.json
COPY packages/config/eslint/package.json packages/config/eslint/package.json
# API package.json needed for workspace resolution
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY . .
RUN pnpm --filter @personal-os/web build

# ---- Dev (used by docker-compose.yml) ----
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["pnpm", "--filter", "@personal-os/web", "dev", "--", "--host"]

# ---- Production ----
FROM nginx:alpine AS production
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
