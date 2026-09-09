# Blob storage for the PDS: uploaded media, content-addressed by CID. The PDS
# talks to it through its S3 blobstore over Cloud Storage's S3-compatible XML
# API (storage.googleapis.com, HMAC credentials), so the data disk holds only
# SQLite and the actor store and never grows with uploads.
#
# The HMAC key is NOT a Terraform resource: google_storage_hmac_key stores the
# secret in state (ADR 0001). README.md step 3 creates it
# with gcloud for the PDS service account and adds both halves to Secret
# Manager; the key inherits the account's IAM, granted in iam.tf.
resource "google_storage_bucket" "pds_blobs" {
  name     = local.blob_bucket
  location = var.region
  labels   = local.labels

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  # Blobs are immutable and content-addressed; object versioning would only
  # double the bill. The default 7-day soft delete covers accidental deletes.

  # Deliberate destruction means removing this block first, in its own
  # reviewed change — same rule as the data disk.
  lifecycle {
    prevent_destroy = true
  }
}
