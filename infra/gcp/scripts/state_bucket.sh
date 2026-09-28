#!/usr/bin/env bash
# state_bucket <path/to/env.gcs.tfbackend>: the bucket name in that file, and
# nothing else — the one thing bootstrap.sh and terraform-checks.yml need
# before Terraform is initialised. Same shape as locals.tf's `state_bucket`
# regex, so this and it agree by construction rather than by convention.
# Sourced by bootstrap.sh; run from infra/gcp.
state_bucket() {
  sed -n 's/^bucket[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' "$1"
}
