output "zone" {
  description = "The project and managed-zone NAME (not dns_name), for any stack that writes a record into this zone."
  value = {
    project = var.project_id
    name    = google_dns_managed_zone.root.name
  }
}

output "name_servers" {
  description = "The Cloud DNS four to enter in Squarespace (README step 5)."
  value       = google_dns_managed_zone.root.name_servers
}

output "ds_record" {
  description = "The DS to add in Squarespace (README step 6), as `key_tag algorithm digest_type digest`."

  # The data source returns every key signing key the zone has ever had,
  # retired ones included, so a plain one() over the whole list blows up with
  # "must be a list ... with either zero or one elements" the first time a KSK
  # is rolled — and it blows up in plan, taking the whole module with it.
  # Exactly one KSK is active at a time.
  value = one([for k in data.google_dns_keys.root.key_signing_keys : k.ds_record if k.is_active])
}
