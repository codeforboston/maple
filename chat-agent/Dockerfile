# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN yarn build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Cloud Run sets PORT; default to 8080 to match Cloud Run's expected port
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# DATABASE_URL, GOOGLE_API_KEY, AGENT_SERVICE_TOKEN and MAPLE_MCP_TOKEN come from
# Secret Manager at deploy time (deploy.sh); MAPLE_MCP_URL, CHAT_MODEL and the
# budgets are plain env vars.

EXPOSE 8080

USER node
CMD ["node", "dist/server.js"]
