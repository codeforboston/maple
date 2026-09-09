# digital-testimony-prod is inaccessible until the prod handoff; this
# file is applied then, by an owner, and confirmed with the upstream owners
# first. Only the hostname is decided already.
env        = "prod"
project_id = "digital-testimony-prod"

# APPLY-ONCE. Reserved for production on purpose — dev lives at the sibling
# pds-dev.mapletestimony.org so the clean name is never burned into a dev DID.
# Confirm with the identity and handoff owners before the first prod apply.
pds_hostname = "pds.mapletestimony.org"

# The public relay; without it MAPLE's records reach nobody.
pds_crawlers = "https://bsky.network"

# No CI plans against prod: applies there are rare, human, and reviewed live.
ci_planner = null
