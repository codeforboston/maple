# ── Build stage ───────────────────────────────────────────────────────────────
# Built from the repo root (deploy.sh), so the image can include mcp-server's queries.
FROM node:24-slim AS builder

WORKDIR /app/chat-agent

COPY chat-agent/package.json chat-agent/yarn.lock ./
RUN yarn install --frozen-lockfile
# mcp-server/queries.ts imports firebase-admin and Vertex AI; this lets it find them here.
RUN ln -s chat-agent/node_modules /app/node_modules

COPY chat-agent/tsconfig.json chat-agent/tsconfig.build.json ./
COPY chat-agent/src ./src
COPY mcp-server/queries.ts /app/mcp-server/
RUN yarn build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:24-slim AS runtime

WORKDIR /app

# Install only production dependencies
COPY chat-agent/package.json chat-agent/yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy compiled output: dist/chat-agent/src and dist/mcp-server
COPY --from=builder /app/chat-agent/dist ./dist

# Cloud Run sets PORT; default to 8080 to match Cloud Run's expected port
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# DATABASE_URL, GOOGLE_API_KEY and AGENT_SERVICE_TOKEN come from Secret Manager
# at deploy time (deploy.sh); FIREBASE_PROJECT_ID, CHAT_MODEL and the budgets are
# plain env vars. Firestore and Vertex AI use the service account's credentials.

EXPOSE 8080

USER node
CMD ["node", "dist/chat-agent/src/server.js"]
