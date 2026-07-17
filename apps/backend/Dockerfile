FROM node:22-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml .
COPY apps/backend/package.json ./apps/backend/
COPY packages/ui/package.json ./packages/ui/
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app/apps/backend
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=build /app/apps/backend/dist dist
COPY --from=build /app/apps/backend/package.json package.json
COPY --from=build /app/apps/backend/node_modules node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
