resource "google_service_account" "pds" {
  account_id   = "atproto-pds"
  display_name = "atproto PDS VM"
}
