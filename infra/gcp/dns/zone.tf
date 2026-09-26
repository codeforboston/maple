# The public zone for mapletestimony.org, moved out of the Squarespace panel.
# Records: records.tf.
resource "google_dns_managed_zone" "root" {
  name        = "mapletestimony-org"
  dns_name    = local.zone
  description = "mapletestimony.org. Records: infra/gcp/dns/records.tf."
  visibility  = "public"

  # Signed from day one. Until the DS is entered at the registrar (README
  # step 6) validators treat the zone as unsigned, so this is harmless
  # early and mandatory later. Un-signing is a reviewed edit here, made with
  # the DS already deleted in Squarespace.
  dnssec_config {
    state = "on"

    # ECDSA P-256 for both keys (algorithm 13), a fraction of the response
    # size of the RSA defaults. Note this is not what the zone signs with
    # today: the DS the registry publishes for the Squarespace zone is
    # `60530 8 2 ...`, algorithm 8, RSASHA256. The change of algorithm is
    # safe here only because the DS is withdrawn in step 4 and a fresh one is
    # published in step 6 — never edit this while a DS is live.
    # Changeable only while state is off.
    default_key_specs {
      key_type   = "keySigning"
      algorithm  = "ecdsap256sha256"
      key_length = 256
    }
    default_key_specs {
      key_type   = "zoneSigning"
      algorithm  = "ecdsap256sha256"
      key_length = 256
    }
  }

  # Recreating the zone assigns four new name servers: the ones in Squarespace
  # go stale and the domain goes dark. Destroying this is its own reviewed
  # change, run with the registrar panel open.
  lifecycle {
    prevent_destroy = true
  }
}

# The DS record to enter in Squarespace once the NS swap has settled (README
# step 6).
data "google_dns_keys" "root" {
  managed_zone = google_dns_managed_zone.root.id
}
