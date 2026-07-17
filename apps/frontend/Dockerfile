FROM node:22-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml .
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ui/package.json ./packages/ui/
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app/apps/frontend
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=build /app/apps/frontend/.next .next
COPY --from=build /app/apps/frontend/public public
COPY --from=build /app/apps/frontend/package.json package.json
COPY --from=build /app/apps/frontend/next.config.mjs next.config.mjs
COPY --from=build /app/apps/frontend/.next .next
COPY --from=build /app/apps/frontend/node_modules node_modules
EXPOSE 3000
CMD ["pnpm", "start"]
