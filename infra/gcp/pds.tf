resource "google_compute_disk" "pds_data" {
  name   = "atproto-pds-data"
  type   = "pd-balanced"
  zone   = var.zone
  size   = var.data_disk_size_gb
  labels = local.labels

  # The PDS's SQLite databases and actor store live here (blobs: blobs.tf).
  # Deliberate destruction
  # means removing this block first, in its own reviewed change.
  lifecycle {
    prevent_destroy = true
  }
}

resource "google_compute_resource_policy" "pds_snapshots" {
  name   = "atproto-pds-daily-snapshots"
  region = var.region

  snapshot_schedule_policy {
    schedule {
      daily_schedule {
        days_in_cycle = 1
        # UTC. Daily schedules must start on a multiple of four hours (00, 04,
        # 08, ...); the provider only checks HH:00, so a bad value fails at apply.
        start_time = "04:00"
      }
    }

    retention_policy {
      max_retention_days    = 14
      on_source_disk_delete = "KEEP_AUTO_SNAPSHOTS"
    }
  }
}

resource "google_compute_disk_resource_policy_attachment" "pds_snapshots" {
  name = google_compute_resource_policy.pds_snapshots.name
  disk = google_compute_disk.pds_data.name
  zone = var.zone
}

resource "google_compute_instance" "pds" {
  name         = "atproto-pds"
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["atproto-pds"]
  labels       = local.labels

  deletion_protection       = true
  allow_stopping_for_update = true

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      type  = "pd-balanced"
      size  = 10
    }
  }

  attached_disk {
    source = google_compute_disk.pds_data.id
    # Surfaces in the guest as /dev/disk/by-id/google-pds-data (the startup
    # script mounts it by that path).
    device_name = "pds-data"
  }

  network_interface {
    network = var.network

    access_config {
      nat_ip = google_compute_address.pds.address
    }
  }

  service_account {
    email = google_service_account.pds.email
    # Broad scope on purpose: real authorization is the IAM granted in
    # iam.tf, not OAuth scopes.
    scopes = ["cloud-platform"]
  }

  # metadata (not metadata_startup_script): the latter forces VM replacement on
  # any script change, which deletion_protection would turn into a failed
  # apply. As metadata, a script change is an in-place update that takes
  # effect on the next boot.
  metadata = {
    startup-script = templatefile("${path.module}/templates/pds-startup.sh.tftpl", {
      project_id   = var.project_id
      pds_hostname = var.pds_hostname
      pds_image    = local.pds_image
      caddy_image  = local.caddy_image
      pds_secrets  = local.pds_secrets
      pds_crawlers = var.pds_crawlers
      blob_bucket  = local.blob_bucket
    })
  }
}
