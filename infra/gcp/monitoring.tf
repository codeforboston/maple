# Where alerts go, shared by every alert policy in this root; per-component
# policies live in monitoring-<component>.tf against the locals below.
#
# One channel per entry in alert_channels (envs/<env>.tfvars). Swapping dev's
# email for prod's pager is a tfvars change and nothing else.
resource "google_monitoring_notification_channel" "alert" {
  for_each = var.alert_channels

  display_name = "atproto ${var.env} ${each.key}"
  type         = each.value.type
  labels       = each.value.labels
  user_labels  = local.labels
}

locals {
  alert_channel_ids = [for c in google_monitoring_notification_channel.alert : c.id]
  alert_runbook     = "Runbook: infra/gcp/README.md, Monitoring."
}
