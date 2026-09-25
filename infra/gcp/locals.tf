locals {
  # Pinned here so this root applies standalone. The local harness
  # (infra/atproto/images.env, on the atproto-core branch) pins the same PDS
  # tag; bump both together once that branch lands. Caddy fronts only the
  # deployed VM and has no harness counterpart.
  pds_image   = "ghcr.io/bluesky-social/pds:0.4.5027"
  caddy_image = "caddy:2.10"

  # The state bucket is created by scripts/bootstrap.sh, not managed here; its
  # name lives in envs/<env>.gcs.tfbackend and nowhere else, so read it from
  # there for the CI planner's grant (iam.tf) rather than typing it twice.
  # (?m)^ so a commented-out `bucket = "…"` line cannot win: scripts/bootstrap.sh
  # and terraform-checks.yml both read this file the same way, via the anchored
  # sed in scripts/state_bucket.sh, and a grant on the wrong bucket would be
  # silent.
  state_bucket = regex("(?m)^bucket\\s*=\\s*\"([^\"]+)\"", file("${path.module}/envs/${var.env}.gcs.tfbackend"))[0]

  # PDS env var -> Secret Manager secret id. The one definition in this root:
  # drives the secret resources (secrets.tf), their accessor grants (iam.tf),
  # the boot-time fetch loop and the pds.env lines
  # (templates/pds-startup.sh.tftpl), and the pds_secrets output.
  pds_secrets = {
    PDS_ADMIN_PASSWORD                        = "atproto-pds-admin-password"
    PDS_JWT_SECRET                            = "atproto-pds-jwt-secret"
    PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX = "atproto-pds-plc-rotation-key"
    # The HMAC key pair for the blob bucket (blobs.tf). Created out of band
    # with `gcloud storage hmac create` for the PDS service account: the
    # google_storage_hmac_key resource would put the secret in state.
    PDS_BLOBSTORE_S3_ACCESS_KEY_ID     = "atproto-pds-blob-access-key-id"
    PDS_BLOBSTORE_S3_SECRET_ACCESS_KEY = "atproto-pds-blob-secret-access-key"
  }

  blob_bucket = "${var.project_id}-atproto-pds-blobs"

  labels = {
    app = "atproto"
    env = var.env
  }
}
