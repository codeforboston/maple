# Secret RESOURCES only — never versions. Terraform state stores values in
# plaintext, so secret material is added out of band (ADR 0001):
#   gcloud secrets versions add <secret-id> --data-file=-
resource "google_secret_manager_secret" "pds" {
  for_each = toset(values(local.pds_secrets))

  secret_id = each.value
  labels    = local.labels

  replication {
    auto {}
  }
}
