#!/usr/bin/env bash
# After terraform apply: mint the PDS's five secret versions. The VM's startup
# script retries every 3 minutes until they exist (pds-startup-retry.timer),
# so nothing here reboots or resets anything. Values go straight into Secret
# Manager; nothing is printed, written to disk here, or kept in shell history.
# Idempotent: a secret that already has a version is left alone, so re-running
# never rotates anything by accident. Editor plus storage.hmacKeys.create.
# Needs the root initialised (terraform init) — the ids and the service
# account come from its outputs. Usage: infra/gcp/scripts/secrets.sh <dev|prod>
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/tfvar.sh
env=${1:?usage: secrets.sh <dev|prod>}
project=$(tfvar "$env" project_id)
sa=$(terraform output -raw pds_service_account)
instance=$(terraform output -json pds_instance)
secrets=$(terraform output -json pds_secrets)
# The outputs come from whichever backend was last `terraform init`ed, the
# project from the argument. Mixed up, this mints one environment's secrets
# against the other environment's service account. Refuse rather than half-run.
case "$sa" in
  *"@$project.iam.gserviceaccount.com") ;;
  *)
    echo "secrets.sh: the initialised root's service account is $sa, but env $env is $project." >&2
    echo "  terraform -chdir=infra/gcp init -reconfigure -backend-config=envs/$env.gcs.tfbackend" >&2
    exit 1
    ;;
esac
# id <PDS_ENV_VAR>: its Secret Manager id, from locals.pds_secrets.
id() { printf %s "$secrets" | python3 -c 'import json,sys; print(json.load(sys.stdin)[sys.argv[1]], end="")' "$1"; }

# "no enabled version" and "could not ask" are NOT the same answer: swallowing
# the second one turns an expired login or a missing secretmanager.versions.list
# into a silent re-mint of every secret below, and re-minting the PLC rotation
# key strands the DID document's rotationKeys. Every caller runs in the main
# shell, so exiting here stops the run.
has_version() {
  local out
  if ! out=$(gcloud secrets versions list "$1" --project="$project" --filter='state=enabled' --format='value(name)' --limit=1); then
    echo "secrets.sh: cannot list versions of $1; refusing to mint one blindly" >&2
    exit 1
  fi
  [ -n "$out" ]
}
add() { tr -d '\n' | gcloud secrets versions add "$1" --project="$project" --data-file=- >/dev/null; echo "added $1"; }
# ensure <secret-id> <command...>: a version from the command's stdout, unless
# one exists already. The generator runs to completion BEFORE add: piped into
# it, a generator that died would still hand add its (empty) stdout, and the
# empty version it wrote would then read as "has a version" for good.
ensure() {
  if has_version "$1"; then echo "kept  $1 (has a version)"; return; fi
  local value
  value=$("${@:2}")
  [ -n "$value" ] || { echo "secrets.sh: $2 produced nothing for $1" >&2; exit 1; }
  printf %s "$value" | add "$1"
}
# Same shapes as the upstream installer.sh. The rotation key is a raw
# secp256k1 scalar as 64 hex chars; the PDS refuses to boot otherwise.
rotation_key() { openssl ecparam -name secp256k1 -genkey -noout -outform DER | tail -c +8 | head -c 32 | xxd -p -c 32; }

ensure "$(id PDS_ADMIN_PASSWORD)" openssl rand -hex 16
ensure "$(id PDS_JWT_SECRET)" openssl rand -hex 16
ensure "$(id PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX)" rotation_key

# Blob bucket HMAC key for the PDS service account; the secret is shown once,
# so both halves go from the JSON straight into Secret Manager, id first. A
# run that died between the two adds left a key whose secret half nobody
# holds: retire it by the id we did store, then mint a fresh pair, so the
# account never accumulates orphaned keys.
key_id=$(id PDS_BLOBSTORE_S3_ACCESS_KEY_ID)
key_secret=$(id PDS_BLOBSTORE_S3_SECRET_ACCESS_KEY)
if has_version "$key_id" && has_version "$key_secret"; then
  echo "kept  $key_id (has a version)"; echo "kept  $key_secret (has a version)"
else
  if has_version "$key_id"; then
    orphan=$(gcloud secrets versions access latest --secret="$key_id" --project="$project")
    echo "retiring HMAC key $orphan (stored id without its secret)"
    gcloud storage hmac update "$orphan" --project="$project" --deactivate >/dev/null
    gcloud storage hmac delete "$orphan" --project="$project" >/dev/null
  fi
  hmac=$(gcloud storage hmac create "$sa" --project="$project" --format=json)
  printf %s "$hmac" | python3 -c 'import json,sys; print(json.load(sys.stdin)["metadata"]["accessId"], end="")' | add "$key_id"
  printf %s "$hmac" | python3 -c 'import json,sys; print(json.load(sys.stdin)["secret"], end="")' | add "$key_secret"
  unset hmac
fi

name=$(printf %s "$instance" | python3 -c 'import json,sys; print(json.load(sys.stdin)["name"], end="")')
zone=$(printf %s "$instance" | python3 -c 'import json,sys; print(json.load(sys.stdin)["zone"], end="")')
echo "== $name picks the secrets up within 3 minutes (pds-startup-retry.timer)"
echo "watch: gcloud compute instances get-serial-port-output $name --project=$project --zone=$zone | grep pds-startup"
