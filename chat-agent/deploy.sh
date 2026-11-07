#!/usr/bin/env bash
# Build the Ask MAPLE agent image and deploy it as a Cloud Run service.
# Safe to re-run: existing resources are updated.
#
# Usage: ./deploy.sh <gcp-project>
#
# Requires docker (authorized for Artifact Registry via
# `gcloud auth configure-docker us-central1-docker.pkg.dev`) and four
# Secret Manager secrets in the project: ask-maple-database-url,
# ask-maple-google-api-key, ask-maple-agent-token, ask-maple-mcp-token.
# MAPLE_MCP_URL is required. CHAT_MODEL, MONTHLY_TOKEN_BUDGET and
# GLOBAL_MONTHLY_TOKEN_BUDGET may be set to override the defaults below.
set -euo pipefail

PROJECT=${1:?usage: $0 <gcp-project>}
MAPLE_MCP_URL=${MAPLE_MCP_URL:?set MAPLE_MCP_URL, e.g. https://maple-dev.vercel.app/api/mcp}
REGION=us-central1
REPO=ask-maple
SERVICE=ask-maple-agent
RUNTIME_SA_NAME=ask-maple-agent
RUNTIME_SA=$RUNTIME_SA_NAME@$PROJECT.iam.gserviceaccount.com
IMAGE=$REGION-docker.pkg.dev/$PROJECT/$REPO/agent:latest
SECRETS=(ask-maple-database-url ask-maple-google-api-key ask-maple-agent-token ask-maple-mcp-token)

cd "$(dirname "$0")"

gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com --project="$PROJECT"

for secret in "${SECRETS[@]}"; do
  if ! gcloud secrets describe "$secret" --project="$PROJECT" >/dev/null 2>&1; then
    echo "Secret $secret is missing; create it first." >&2
    exit 1
  fi
done

if ! gcloud artifacts repositories describe "$REPO" \
  --location="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker --location="$REGION" --project="$PROJECT"
fi

docker build --platform=linux/amd64 -t "$IMAGE" .
docker push "$IMAGE"

# The service runs as a dedicated service account that may only read its own
# secrets.
if ! gcloud iam service-accounts describe "$RUNTIME_SA" \
  --project="$PROJECT" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$RUNTIME_SA_NAME" \
    --display-name="Ask MAPLE agent" --project="$PROJECT"
fi
for secret in "${SECRETS[@]}"; do
  gcloud secrets add-iam-policy-binding "$secret" \
    --member="serviceAccount:$RUNTIME_SA" \
    --role=roles/secretmanager.secretAccessor \
    --project="$PROJECT" >/dev/null
done

# Public URL; the bearer token (AGENT_SERVICE_TOKEN) is the gate.
gcloud run deploy "$SERVICE" \
  --image="$IMAGE" \
  --service-account="$RUNTIME_SA" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=2 \
  --timeout=300 \
  --set-secrets=DATABASE_URL=ask-maple-database-url:latest,GOOGLE_API_KEY=ask-maple-google-api-key:latest,AGENT_SERVICE_TOKEN=ask-maple-agent-token:latest,MAPLE_MCP_TOKEN=ask-maple-mcp-token:latest \
  --set-env-vars=MAPLE_MCP_URL=$MAPLE_MCP_URL,CHAT_MODEL=${CHAT_MODEL:-gemini-3.8-flash},EMBEDDING_MODEL=gemini-embedding-001,EMBEDDING_DIMS=768,MONTHLY_TOKEN_BUDGET=${MONTHLY_TOKEN_BUDGET:-200000},GLOBAL_MONTHLY_TOKEN_BUDGET=${GLOBAL_MONTHLY_TOKEN_BUDGET:-2000000} \
  --region="$REGION" --project="$PROJECT"

URL=$(gcloud run services describe "$SERVICE" \
  --region="$REGION" --project="$PROJECT" --format='value(status.url)')
echo "Deployed $IMAGE to $SERVICE at $URL"
echo "Set CHAT_AGENT_URL=$URL in the Vercel project."
