# syntax=docker/dockerfile:1.7
# ---- Build stage ----
# Reserved for future build steps (e.g. bundling game.js, transpilation).
# Currently a passthrough so the production image can keep a multi-stage
# shape and we don't pay a refactor cost later.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# ---- Dependencies stage ----
# Isolates node_modules so the runtime image can copy them verbatim
# without dragging devDependencies along.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app

# Install wget for the compose healthcheck. Kept in this layer so the
# final image stays minimal but self-contained for orchestration.
RUN apk add --no-cache wget dumb-init \
    && mkdir -p /app/data \
    && chown -R node:node /app

ENV NODE_ENV=production \
    DATA_DIR=/app/data \
    PORT=3000

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node server.js game.js en.js index.html ./

EXPOSE 3000

USER node
STOPSIGNAL SIGTERM

# dumb-init reaps zombies and forwards signals (SIGTERM) to node so
# the process exits cleanly on `docker stop` instead of being killed
# after the 10s grace period.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
