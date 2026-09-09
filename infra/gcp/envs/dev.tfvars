env        = "dev"
project_id = "digital-testimony-dev"

# APPLY-ONCE: the hostname is baked into the DID document at account creation
# and is effectively immutable. Environments get sibling names under the
# parent domain — pds-dev here, pds for prod — so neither zone nests inside the
# other and the clean name stays reserved for production.
pds_hostname = "pds-dev.mapletestimony.org"

# Dev is announced to the public relay so what it emits is visible off the
# box. Set to "" to run dark.
pds_crawlers = "https://bsky.network"

# The service account behind the terraform-plan GitHub environment's
# GCP_SERVICE_ACCOUNT_KEY (CI.md). Read-only on the state bucket. Set it
# once that environment exists in codeforboston/maple; null = plans skipped.
ci_planner = null
