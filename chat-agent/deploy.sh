#!/usr/bin/env bash
# Build the Ask MAPLE agent image and deploy it as a Cloud Run service.
# Safe to re-run: existing resources are updated.
#
# Usage: ./deploy.sh <gcp-project>
#
# Deploy to the project that holds MAPLE's Firestore data (digital-testimony-dev,
# or -prod): the agent reads bills and testimony from it directly.
#
# Requires docker (authorized for Artifact Registry via
# `gcloud auth configure-docker us-central1-docker.pkg.dev`) and three
# Secret Manager secrets in the project: ask-maple-database-url,
# ask-maple-google-api-key, ask-maple-agent-token. CHAT_MODEL, MEMORY,
# MONTHLY_TOKEN_BUDGET and GLOBAL_MONTHLY_TOKEN_BUDGET may be set to override
# the defaults below.
set -euo pipefail

PROJECT=${1:?usage: $0 <gcp-project>}
REGION=us-central1
REPO=ask-maple
SERVICE=ask-maple-agent
RUNTIME_SA_NAME=ask-maple-agent
RUNTIME_SA=$RUNTIME_SA_NAME@$PROJECT.iam.gserviceaccount.com
IMAGE=$REGION-docker.pkg.dev/$PROJECT/$REPO/agent:latest
SECRETS=(ask-maple-database-url ask-maple-google-api-key ask-maple-agent-token)

cd "$(dirname "$0")"

gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com aiplatform.googleapis.com --project="$PROJECT"

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

# From the repo root: the image includes mcp-server/queries.ts.
docker build --platform=linux/amd64 -f Dockerfile -t "$IMAGE" ..
docker push "$IMAGE"

# The service runs as a dedicated service account that may read its own secrets,
# read Firestore (all of it: IAM can't limit it to collections, so every read
# goes through mcp-server's queries) and embed queries with Vertex AI.
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
for role in roles/datastore.viewer roles/aiplatform.user; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:$RUNTIME_SA" --role="$role" \
    --condition=None >/dev/null
done

# Public URL; the bearer token (AGENT_SERVICE_TOKEN) is the gate.
gcloud run deploy "$SERVICE" \
  --image="$IMAGE" \
  --service-account="$RUNTIME_SA" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=2 \
  --timeout=300 \
  --memory="${MEMORY:-1Gi}" \
  --set-secrets=DATABASE_URL=ask-maple-database-url:latest,GOOGLE_API_KEY=ask-maple-google-api-key:latest,AGENT_SERVICE_TOKEN=ask-maple-agent-token:latest \
  --set-env-vars=FIREBASE_PROJECT_ID=$PROJECT,CHAT_MODEL=${CHAT_MODEL:-gemini-3.8-flash},EMBEDDING_MODEL=gemini-embedding-001,EMBEDDING_DIMS=768,MONTHLY_TOKEN_BUDGET=${MONTHLY_TOKEN_BUDGET:-200000},GLOBAL_MONTHLY_TOKEN_BUDGET=${GLOBAL_MONTHLY_TOKEN_BUDGET:-2000000} \
  --region="$REGION" --project="$PROJECT"

URL=$(gcloud run services describe "$SERVICE" \
  --region="$REGION" --project="$PROJECT" --format='value(status.url)')
echo "Deployed $IMAGE to $SERVICE at $URL"
echo "Set CHAT_AGENT_URL=$URL in the Vercel project."
