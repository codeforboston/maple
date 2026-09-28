#!/usr/bin/env bash
# After terraform apply: mint the PDS's five secret versions. The VM's startup
# script retries every 3 minutes until they exist (pds-startup-retry.timer),
# so nothing here reboots or resets anything. Values go straight into Secret
# Manager; nothing is printed, written to disk here, or kept in shell history.
# Idempotent: a secret that already has a version is left alone, so re-running
# never rotates anything by accident. Editor is enough (it carries
# storage.hmacKeys.*). Needs the root initialised (terraform init) — the ids and the service
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
# jget <a.b.c>: that field of the JSON on stdin, no trailing newline. A missing
# key is a KeyError, so a stale or half-applied root fails here, not later.
jget() { python3 -c 'import functools,json,sys; print(functools.reduce(lambda d, k: d[k], sys.argv[1].split("."), json.load(sys.stdin)), end="")' "$1"; }
# id <PDS_ENV_VAR>: its Secret Manager id, from locals.pds_secrets.
id() { printf %s "$secrets" | jget "$1"; }

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
# secp256k1 scalar as 64 hex chars; the PDS refuses to boot otherwise. Read
# out of the DER by asn1parse rather than at a fixed offset: LibreSSL (macOS's
# /usr/bin/openssl) strips a leading zero byte from the scalar about one time
# in 256, and a fixed `tail -c +8 | head -c 32` would then hand back 31 key
# bytes plus the next tag byte — a valid-looking key nobody generated.
rotation_key() {
  local hex
  hex=$(openssl ecparam -name secp256k1 -genkey -noout -outform DER \
    | openssl asn1parse -inform DER \
    | awk -F'HEX DUMP\\]:' '/OCTET STRING/ { print tolower($2); exit }' | tr -d '\n')
  [[ $hex =~ ^[0-9a-f]{2,64}$ ]] || { echo "secrets.sh: openssl produced no secp256k1 scalar" >&2; exit 1; }
  printf '%064s' "$hex" | tr ' ' 0
}

ensure "$(id PDS_ADMIN_PASSWORD)" openssl rand -hex 16
ensure "$(id PDS_JWT_SECRET)" openssl rand -hex 16
ensure "$(id PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX)" rotation_key

# Blob bucket HMAC key for the PDS service account; the secret is shown once,
# so both halves go from the JSON straight into Secret Manager, id first. A
# run that died between the two adds left a key whose secret half nobody
# holds: retire it by the id we did store. The reverse (a secret stored with
# no id — not reachable from this script's own order, but possible if
# something else touched one half out of band) retires every key on the
# account instead, since a bare secret value cannot be matched back to one.
# Either way, mint a fresh pair after, so the account never accumulates
# orphaned keys.
key_id=$(id PDS_BLOBSTORE_S3_ACCESS_KEY_ID)
key_secret=$(id PDS_BLOBSTORE_S3_SECRET_ACCESS_KEY)
have_id=false;     has_version "$key_id"     && have_id=true
have_secret=false; has_version "$key_secret" && have_secret=true
if $have_id && $have_secret; then
  echo "kept  $key_id (has a version)"; echo "kept  $key_secret (has a version)"
else
  if $have_id; then
    orphan=$(gcloud secrets versions access latest --secret="$key_id" --project="$project")
    echo "retiring HMAC key $orphan (stored id without its secret)"
    gcloud storage hmac update "$orphan" --project="$project" --deactivate >/dev/null
    gcloud storage hmac delete "$orphan" --project="$project" >/dev/null
  elif $have_secret; then
    # The symmetric case: a secret half stored with no id alongside it.
    # Secret Manager has no reverse lookup from value to id, so we cannot
    # single out which existing HMAC key it belongs to; retire every key this
    # service account holds before minting a fresh pair, so nothing this
    # script can no longer name is left active.
    for orphan in $(gcloud storage hmac list --service-account="$sa" --project="$project" --format='value(accessId)'); do
      echo "retiring HMAC key $orphan (stored secret without its id)"
      gcloud storage hmac update "$orphan" --project="$project" --deactivate >/dev/null
      gcloud storage hmac delete "$orphan" --project="$project" >/dev/null
    done
  fi
  hmac=$(gcloud storage hmac create "$sa" --project="$project" --format=json)
  printf %s "$hmac" | jget metadata.accessId | add "$key_id"
  printf %s "$hmac" | jget secret | add "$key_secret"
fi

name=$(printf %s "$instance" | jget name)
zone=$(printf %s "$instance" | jget zone)
echo "== $name picks the secrets up within 3 minutes (pds-startup-retry.timer)"
echo "watch: gcloud compute instances get-serial-port-output $name --project=$project --zone=$zone | grep pds-startup"
