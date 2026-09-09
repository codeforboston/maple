# Partial backend configuration — the bucket/prefix come from
# envs/<env>.gcs.tfbackend at init time:
#   terraform init -backend-config=envs/dev.gcs.tfbackend
terraform {
  backend "gcs" {}
}
