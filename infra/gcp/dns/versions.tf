# Keep terraform_version in .github/workflows/terraform-checks.yml in lockstep
# with required_version here.
terraform {
  required_version = "~> 1.16.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.46"
    }
  }
}
