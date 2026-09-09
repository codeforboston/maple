# Every IAM grant for the atproto stack, in the same root as the resources it
# grants on. Two rules:
#
# - The *_iam_member form only, NEVER *_iam_binding: binding is authoritative
#   for its role and would silently strip the other owners of these shared
#   projects.
# - Editors can PLAN this file but not APPLY it: roles/editor lacks every
#   setIamPolicy. Nothing else here depends on a grant, so an editor's apply
#   creates everything else and fails only these; an owner's apply afterwards
#   plans exactly the grants and nothing more, which is the review artifact
#   ADR 0001 asks for. Without the grants the PDS does not run: its
#   service account cannot read its secrets, write its blobs, or log.

# Secret-level (not project-level): the PDS VM reads exactly its five secrets
# at boot and nothing else.
resource "google_secret_manager_secret_iam_member" "pds_secret_access" {
  for_each  = google_secret_manager_secret.pds
  secret_id = each.value.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.pds.email}"
}

# Bucket-level: the PDS's HMAC key inherits this and reaches this one bucket
# only. objectAdmin because the PDS deletes blobs when a record that referenced
# them is deleted.
resource "google_storage_bucket_iam_member" "pds_blobs_object_admin" {
  bucket = google_storage_bucket.pds_blobs.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.pds.email}"
}

resource "google_project_iam_member" "pds_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.pds.email}"
}

resource "google_project_iam_member" "pds_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.pds.email}"
}

# CI plans (terraform-checks.yml) read this environment's state and the parent
# DNS zone, nothing else: `plan -refresh=false -lock=false` needs the state
# object, the workflow's bootstrap gate lists the bucket, and the data source
# in dns.tf reads the zone. Neither grant can write state or touch a resource,
# so a leaked CI key cannot apply.
resource "google_storage_bucket_iam_member" "ci_planner_state_reader" {
  count  = var.ci_planner == null ? 0 : 1
  bucket = local.state_bucket
  role   = "roles/storage.objectViewer"
  member = var.ci_planner
}

# Applying this one needs an owner of the PARENT zone's project, like the NS
# record itself (dns.tf).
resource "google_project_iam_member" "ci_planner_parent_zone_reader" {
  count   = var.ci_planner == null ? 0 : 1
  project = local.parent_zone.project
  role    = "roles/dns.reader"
  member  = var.ci_planner
}
