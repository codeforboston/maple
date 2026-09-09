variable "env" {
  description = "Environment name (dev or prod). Names things (labels) and selects envs/<env>.gcs.tfbackend for the CI planner's state-bucket grant (locals.tf). Isolation comes from the separate GCP projects, not from this."
  type        = string
}

variable "project_id" {
  description = "GCP project id (digital-testimony-dev / digital-testimony-prod)."
  type        = string
}

variable "region" {
  description = "Region for regional resources. Confirm it matches the project's Firestore location at bootstrap (see README)."
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zone for the PDS VM and its data disk. Must sit inside region: the snapshot policy is regional and attaches to the zonal disk."
  type        = string
  default     = "us-central1-a"

  validation {
    condition     = startswith(var.zone, "${var.region}-")
    error_message = "zone must be a zone of region (e.g. region us-central1, zone us-central1-a)."
  }
}

variable "network" {
  description = "VPC network for the PDS VM and firewall rules."
  type        = string
  default     = "default"
}

variable "pds_hostname" {
  description = "Public hostname of the PDS, and the dns_name of the delegated Cloud DNS zone. APPLY-ONCE: it gets baked into the DID document at account creation and is effectively immutable afterwards. Enforced by prevent_destroy on the zone (dns.tf): a change plans as a replacement and the apply refuses it."
  type        = string
}

variable "machine_type" {
  description = "PDS VM machine type (ADR 0001)."
  type        = string
  default     = "e2-small"
}

variable "data_disk_size_gb" {
  description = "Size of the PDS data disk (SQLite databases + actor store; blobs live in GCS, see blobs.tf)."
  type        = number
  default     = 20
}

variable "pds_crawlers" {
  description = "Comma-separated relay URLs the PDS asks to crawl it on boot (PDS_CRAWLERS). Empty = the PDS is not announced to any relay: nothing downstream of a relay ever sees its repos. Set per environment on purpose."
  type        = string
  default     = "https://bsky.network"
}

variable "ci_planner" {
  description = "IAM member (serviceAccount:…) whose key the terraform-plan GitHub environment holds. Gets read access to this environment's state bucket and to the parent DNS zone (dns.tf), nothing else: enough for `plan -refresh=false` on PRs, not enough to apply. null = no CI plan for this environment."
  type        = string
  default     = null

  validation {
    condition     = var.ci_planner == null || can(regex("^serviceAccount:[^:]+$", var.ci_planner))
    error_message = "ci_planner must be a serviceAccount: member."
  }
}
