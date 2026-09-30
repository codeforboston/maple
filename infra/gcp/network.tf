resource "google_compute_address" "pds" {
  name        = "atproto-pds"
  description = "Static external IP for the PDS; the A record in dns.tf points here."
}

resource "google_compute_firewall" "pds_web" {
  name          = "atproto-pds-allow-web"
  network       = var.network
  target_tags   = ["atproto-pds"]
  source_ranges = ["0.0.0.0/0"]

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }
}

# SSH only via IAP TCP forwarding (gcloud compute ssh --tunnel-through-iap);
# no public port 22.
resource "google_compute_firewall" "pds_ssh_iap" {
  name          = "atproto-pds-allow-ssh-iap"
  network       = var.network
  target_tags   = ["atproto-pds"]
  source_ranges = ["35.235.240.0/20"]

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
}
