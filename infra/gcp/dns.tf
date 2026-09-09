# Delegated zone for the PDS. The parent mapletestimony.org zone is the Cloud
# DNS zone the infra/gcp/dns root owns in digital-testimony-prod; the
# delegation is ONE NS record there, pointing at this zone's name servers
# (parent_ns below). Until the parent zone is authoritative
# (infra/gcp/dns/README.md) this zone is inert: nothing
# resolves, Caddy's HTTP-01 challenge cannot complete, and the PDS is
# unreachable over TLS.
resource "google_dns_managed_zone" "pds" {
  name        = "atproto-pds"
  dns_name    = "${var.pds_hostname}."
  description = "Delegated zone for the atproto PDS (parent NS record: google_dns_record_set.parent_ns)"

  # dns_name forces replacement, and pds_hostname is apply-once (it is in the
  # DID document). A recreated zone gets new name servers, orphaning the
  # by-hand parent NS record. Same rule as the data disk: destroying this is
  # its own reviewed change.
  lifecycle {
    prevent_destroy = true
  }
}

resource "google_dns_record_set" "pds_a" {
  managed_zone = google_dns_managed_zone.pds.name
  name         = google_dns_managed_zone.pds.dns_name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_address.pds.address]
}

# The parent zone, looked up rather than copied: infra/gcp/dns owns it, in the
# prod project for every environment, and applies first. A plan fails here if
# it is missing. Reading it needs dns.reader in that project (the CI planner's
# grant in iam.tf); writing the record below needs dns.admin. The other
# project is reached through `project` alone; no provider alias.
locals {
  parent_zone = { project = "digital-testimony-prod", name = "mapletestimony-org" }
}

data "google_dns_managed_zone" "parent" {
  project = local.parent_zone.project
  name    = local.parent_zone.name
}

# The delegation, in the parent zone.
resource "google_dns_record_set" "parent_ns" {
  project      = data.google_dns_managed_zone.parent.project
  managed_zone = data.google_dns_managed_zone.parent.name
  name         = google_dns_managed_zone.pds.dns_name
  type         = "NS"
  ttl          = 3600 # delegations are stable; 1h keeps resolver churn down
  rrdatas      = google_dns_managed_zone.pds.name_servers

  lifecycle {
    precondition {
      condition     = endswith(google_dns_managed_zone.pds.dns_name, ".${data.google_dns_managed_zone.parent.dns_name}")
      error_message = "pds_hostname must be a subdomain of the parent zone ${data.google_dns_managed_zone.parent.dns_name}"
    }
  }
}
