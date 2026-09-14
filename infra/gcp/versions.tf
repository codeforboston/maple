# Keep terraform_version in .github/workflows/terraform-checks.yml in lockstep
# with required_version here.
terraform {
  required_version = "~> 1.16.0"

  required_providers {
    google = {
      source = "hashicorp/google"
      # v8.0.0 was released 2026-08-26; staying on the mature 7.x line until
      # v8 has settled. Bump deliberately.
      version = "~> 7.46"
    }
  }
}
