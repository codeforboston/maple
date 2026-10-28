#!/usr/bin/env bash
# Build the scraper image and deploy it as a Cloud Run job that Cloud
# Scheduler runs weekly. Safe to re-run: existing resources are updated.
#
# Usage: ./deploy.sh <gcp-project>
#
# Requires docker (authorized for Artifact Registry via
# `gcloud auth configure-docker us-central1-docker.pkg.dev`) and the
# project's raw-HTML archive bucket, <project>-lobbying-archive.
set -euo pipefail

PROJECT=${1:?usage: $0 <gcp-project>}
REGION=us-central1
REPO=maple-lobbying
JOB=maple-lobbying-scraper
TRIGGER=maple-lobbying-weekly
SCHEDULE="0 6 * * 1" # Mondays 06:00 UTC
SCHEDULER_SA_NAME=lobbying-scheduler
SCHEDULER_SA=$SCHEDULER_SA_NAME@$PROJECT.iam.gserviceaccount.com
IMAGE=$REGION-docker.pkg.dev/$PROJECT/$REPO/scraper:latest

cd "$(dirname "$0")"

if ! gcloud storage buckets describe "gs://$PROJECT-lobbying-archive" \
  --project="$PROJECT" >/dev/null 2>&1; then
  echo "Archive bucket gs://$PROJECT-lobbying-archive is missing;" \
    "create it first (see docs/lobbying-disclosure-ingestion.md)." >&2
  exit 1
fi

if ! gcloud artifacts repositories describe "$REPO" \
  --location="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker --location="$REGION" --project="$PROJECT"
fi

docker build -t "$IMAGE" .
docker push "$IMAGE"

if gcloud run jobs describe "$JOB" \
  --region="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud run jobs update "$JOB" \
    --image="$IMAGE" \
    --update-env-vars=ARCHIVE_RAW=1 \
    --region="$REGION" --project="$PROJECT"
else
  gcloud run jobs create "$JOB" \
    --image="$IMAGE" \
    --set-env-vars=ARCHIVE_RAW=1 \
    --task-timeout=24h \
    --max-retries=0 \
    --region="$REGION" --project="$PROJECT"
fi

# Cloud Scheduler runs the job as a dedicated service account that may only
# invoke it.
if ! gcloud iam service-accounts describe "$SCHEDULER_SA" \
  --project="$PROJECT" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SCHEDULER_SA_NAME" \
    --display-name="Lobbying scraper scheduler" --project="$PROJECT"
fi
gcloud run jobs add-iam-policy-binding "$JOB" \
  --member="serviceAccount:$SCHEDULER_SA" \
  --role=roles/run.invoker \
  --region="$REGION" --project="$PROJECT" >/dev/null

TRIGGER_ARGS=(
  --schedule="$SCHEDULE"
  --time-zone=Etc/UTC
  --uri="https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT/jobs/$JOB:run"
  --http-method=POST
  --oauth-service-account-email="$SCHEDULER_SA"
  --location="$REGION"
  --project="$PROJECT"
)
if gcloud scheduler jobs describe "$TRIGGER" \
  --location="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "$TRIGGER" "${TRIGGER_ARGS[@]}"
else
  gcloud scheduler jobs create http "$TRIGGER" "${TRIGGER_ARGS[@]}"
fi

echo "Deployed $IMAGE to $JOB; $TRIGGER runs it on '$SCHEDULE' (UTC)."
