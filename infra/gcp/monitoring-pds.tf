# What we watch on the PDS: unreachable from outside, disk full, memory gone.
# Everything notifies local.alert_channel_ids (monitoring.tf).

# --- Reachability ------------------------------------------------------------
# One HTTPS check from Google's checkers covers the VM, docker, caddy, the
# certificate and the DNS delegation at once, from the same vantage point as
# the relay: relay acceptance dies silently when TLS does, and this is what
# notices. The Caddyfile proxies the whole hostname to the PDS, so the
# endpoint is public. Expect one page during bring-up (delegation,
# certificate, the 3-minute PDS start); it doubles as the proof that the
# channel works.
resource "google_monitoring_uptime_check_config" "pds_health" {
  display_name = "${google_compute_instance.pds.name} ${var.env} /xrpc/_health"
  period       = "60s"
  timeout      = "10s"

  http_check {
    path    = "/xrpc/_health"
    port    = 443
    use_ssl = true
    # An expired certificate pages before the relay quietly drops us.
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = var.pds_hostname
    }
  }

  user_labels = local.labels
}

resource "google_monitoring_alert_policy" "pds_down" {
  display_name          = "${google_compute_instance.pds.name} ${var.env}: down"
  combiner              = "OR"
  severity              = "CRITICAL"
  notification_channels = local.alert_channel_ids
  user_labels           = local.labels

  conditions {
    display_name = "/xrpc/_health failing from two or more regions for 5 minutes"

    # The console's own recipe for an uptime check: over each 20-minute window
    # count the checkers whose latest result is false; more than one of them,
    # sustained 5 minutes, is an outage rather than one checker's bad route.
    condition_threshold {
      filter          = "metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id = \"${google_monitoring_uptime_check_config.pds_health.uptime_check_id}\" AND resource.type = \"uptime_url\""
      comparison      = "COMPARISON_GT"
      threshold_value = 1
      duration        = "300s"

      aggregations {
        alignment_period     = "1200s"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields      = ["resource.label.*"]
      }
    }
  }

  documentation {
    mime_type = "text/markdown"
    subject   = "[${var.env}] PDS down: https://${var.pds_hostname}/xrpc/_health"
    content   = <<-EOT
      `https://${var.pds_hostname}/xrpc/_health` has failed from two or more regions for 5 minutes: the VM, docker, caddy, the certificate or the DNS delegation. First look:

          gcloud compute instances get-serial-port-output ${google_compute_instance.pds.name} --project=${var.project_id} --zone=${var.zone} | grep pds-startup

      ${local.alert_runbook}
    EOT
  }
}

# --- Disk and memory (Ops Agent) ---------------------------------------------
# The default GCE metric set has neither filesystem usage nor memory; the Ops
# Agent (templates/pds-startup.sh.tftpl) adds both under agent.googleapis.com.
locals {
  pds_instance_filter = "resource.type = \"gce_instance\" AND resource.labels.instance_id = \"${google_compute_instance.pds.instance_id}\""
}

# Every real disk: /pds full is the PDS's characteristic death (SQLite actor
# store), and the 10 GB boot disk holds docker's images and logs. The metric's
# device label is the kernel name without /dev, and the agent reports tmpfs,
# udev and docker's overlay mounts under it too; the pattern admits the block
# device prefixes GCE uses (scsi, nvme, virtio, xen) and nothing else, so a
# machine family that enumerates disks differently stays covered.
resource "google_monitoring_alert_policy" "pds_disk" {
  display_name          = "${google_compute_instance.pds.name} ${var.env}: disk over 80%"
  combiner              = "OR"
  severity              = "WARNING"
  notification_channels = local.alert_channel_ids
  user_labels           = local.labels

  conditions {
    display_name = "a disk on the PDS VM is over 80% used for 5 minutes"

    condition_threshold {
      filter          = "metric.type = \"agent.googleapis.com/disk/percent_used\" AND metric.labels.state = \"used\" AND metric.labels.device = monitoring.regex.full_match(\"(sd|nvme|vd|xvd)[a-z0-9]+\") AND ${local.pds_instance_filter}"
      comparison      = "COMPARISON_GT"
      threshold_value = 80
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
        group_by_fields    = ["metric.label.device"]
      }
    }
  }

  documentation {
    mime_type = "text/markdown"
    subject   = "[${var.env}] PDS disk over 80%"
    content   = <<-EOT
      The incident names the device: the second disk (sdb on this machine family) is `/pds`, the PDS's data, and full it stops the PDS; the first is the boot disk with docker. Grow `/pds` with `data_disk_size_gb` in `envs/${var.env}.tfvars`, apply, then `resize2fs` on the box.

      ${local.alert_runbook}
    EOT
  }
}

resource "google_monitoring_alert_policy" "pds_memory" {
  display_name          = "${google_compute_instance.pds.name} ${var.env}: memory over 90%"
  combiner              = "OR"
  severity              = "WARNING"
  notification_channels = local.alert_channel_ids
  user_labels           = local.labels

  conditions {
    display_name = "memory on the PDS VM is over 90% used for 10 minutes"

    condition_threshold {
      filter          = "metric.type = \"agent.googleapis.com/memory/percent_used\" AND metric.labels.state = \"used\" AND ${local.pds_instance_filter}"
      comparison      = "COMPARISON_GT"
      threshold_value = 90
      duration        = "600s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  documentation {
    mime_type = "text/markdown"
    subject   = "[${var.env}] PDS memory over 90%"
    content   = <<-EOT
      The PDS, caddy and the Ops Agent share the VM's memory (${var.machine_type}), and the next step is the OOM killer taking the PDS. `machine_type` in `envs/${var.env}.tfvars` is the knob.

      ${local.alert_runbook}
    EOT
  }
}
