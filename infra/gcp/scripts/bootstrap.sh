#!/usr/bin/env bash
# One-time, per environment, before the first terraform apply. Idempotent.
# Editor is enough. Usage: infra/gcp/scripts/bootstrap.sh <dev|prod>
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/tfvar.sh
. scripts/state_bucket.sh
env=${1:?usage: bootstrap.sh <dev|prod>}
project=$(tfvar "$env" project_id)
region=$(tfvar "$env" region)
bucket=$(state_bucket "envs/$env.gcs.tfbackend")
# infra/gcp/dns shares this bucket by convention (dns/README.md has this
# script bootstrap it too), so a run against a repointed tfbackend on only one
# side must fail loudly here rather than silently create or update the wrong
# bucket for the other root.
dns_backend="dns/envs/$env.gcs.tfbackend"
if [ -f "$dns_backend" ]; then
  dns_bucket=$(state_bucket "$dns_backend")
  if [ "$dns_bucket" != "$bucket" ]; then
    echo "bootstrap.sh: envs/$env.gcs.tfbackend names bucket \"$bucket\" but $dns_backend names \"$dns_bucket\" — infra/gcp and infra/gcp/dns must share one bucket." >&2
    exit 1
  fi
fi

echo "== APIs (Compute, Run, Artifact Registry, Secret Manager are on already)"
gcloud services enable dns.googleapis.com --project="$project"

echo "== state bucket gs://$bucket"
if gcloud storage buckets describe "gs://$bucket" --project="$project" >/dev/null 2>&1; then
  echo "exists"
else
  gcloud storage buckets create "gs://$bucket" --project="$project" --location="$region" \
    --uniform-bucket-level-access --public-access-prevention
fi
# Outside the create branch on purpose: a run that died between create and
# this line would otherwise leave the bucket unversioned for good.
gcloud storage buckets update "gs://$bucket" --versioning >/dev/null
echo "versioning on"

echo "== Firestore location (the region above should sit inside it)"
# Informational: a project with no Firestore database yet must not fail a
# bootstrap that has otherwise finished.
gcloud firestore databases describe --project="$project" --format='value(locationId)' || true
echo "bootstrapped $env. Next: terraform -chdir=infra/gcp init -backend-config=envs/$env.gcs.tfbackend"
