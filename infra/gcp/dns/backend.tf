# Partial backend configuration — the bucket/prefix come from
# envs/<env>.gcs.tfbackend at init time:
#   terraform -chdir=infra/gcp/dns init -backend-config=envs/prod.gcs.tfbackend
terraform {
  backend "gcs" {}
}
