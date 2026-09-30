output "pds_zone_name_servers" {
  description = "Name servers of the delegated PDS zone, as written into the parent zone's NS record (dns.tf). Read back here to check the delegation."
  value       = google_dns_managed_zone.pds.name_servers
}

output "pds_static_ip" {
  description = "Static external IP of the PDS VM."
  value       = google_compute_address.pds.address
}

output "pds_blob_bucket" {
  description = "GCS bucket the PDS stores blobs in; the HMAC key for it is created out of band by scripts/secrets.sh (README, Apply step 3)."
  value       = google_storage_bucket.pds_blobs.name
}

output "pds_service_account" {
  description = "The PDS VM's service account; secrets.sh mints the blob HMAC key for it."
  value       = google_service_account.pds.email
}

output "pds_instance" {
  description = "The PDS VM, for secrets.sh's serial-console hint and for `gcloud compute ssh --tunnel-through-iap`."
  value = {
    name = google_compute_instance.pds.name
    zone = google_compute_instance.pds.zone
  }
}

output "pds_secrets" {
  description = "PDS env var -> Secret Manager secret id (locals.tf). secrets.sh reads this so the ids are typed in exactly one place."
  value       = local.pds_secrets
}
