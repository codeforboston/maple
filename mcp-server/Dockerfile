# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY *.ts ./
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Cloud Run sets PORT; default to 8080 to match Cloud Run's expected port
ENV PORT=8080
ENV HOST=0.0.0.0

# FIREBASE_PROJECT_ID and CURRENT_COURT must be set at deploy time
# No GOOGLE_APPLICATION_CREDENTIALS needed — Cloud Run uses Workload Identity

EXPOSE 8080

CMD ["node", "dist/index-http.js"]
