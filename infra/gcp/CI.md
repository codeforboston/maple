# Terraform CI

`.github/workflows/terraform-checks.yml` runs `fmt -check` and `validate` on both roots (this one
and `dns/`) for every PR, with no setup. Its `plan_dev` job also posts an advisory dev plan to the
job summary, on same-repo PRs in codeforboston/maple only. Fork PRs get no secrets and show the job
skipped; until step 4 below lands it is green with a "plan skipped" line in its summary. Turning the
plan on is one-time work for an owner of both GCP projects (`digital-testimony-dev`, and
`digital-testimony-prod` for the parent-zone grant in step 2) with admin on codeforboston/maple:

1. **The planner identity.** A service account with no roles of its own:

   ```sh
   gcloud iam service-accounts create atproto-ci-planner --project=digital-testimony-dev \
     --display-name="terraform plan from GitHub Actions"
   ```

2. **Its two grants.** In `envs/dev.tfvars` set
   `ci_planner = "serviceAccount:atproto-ci-planner@digital-testimony-dev.iam.gserviceaccount.com"`,
   merge it like any other change, and apply as an owner of both projects (see Permissions; the
   grants are the `ci_planner_*` members in `iam.tf`: read-only on the state bucket and on the
   parent DNS zone's project).
3. **A key.** The one step outside Terraform, so the key material never enters state. Outside the
   working tree too — a service-account private key sitting in the repo is one `git add -A` away
   from being committed:

   ```sh
   keydir=$(mktemp -d)
   gcloud iam service-accounts keys create "$keydir/planner.json" \
     --iam-account=atproto-ci-planner@digital-testimony-dev.iam.gserviceaccount.com
   ```

4. **The GitHub environment.** codeforboston/maple → Settings → Environments → New environment,
   name `terraform-plan`, deployment branches and tags **No restriction**, no required reviewers.
   Environment secrets → Add → `GCP_SERVICE_ACCOUNT_KEY`, value: the contents of
   `$keydir/planner.json`. Then `rm -rf "$keydir"`.
5. **Check.** A PR from a branch in codeforboston/maple that touches `infra/gcp/**` shows the plan
   in the `plan_dev` job summary. A 404 in "Check for the state bucket" means
   `infra/gcp/scripts/bootstrap.sh dev` has not run; a 403 there means the bucket half of step 2 has
   not landed — or, if `bootstrap.sh dev` could not create the bucket because the name was taken,
   that another project owns it (rename it in `envs/dev.gcs.tfbackend`). A 403 in "Plan (dev)" on
   `data.google_dns_managed_zone.parent` means the prod half of step 2 (`ci_planner_parent_zone_reader`)
   has not landed.

Rotate or revoke with `gcloud iam service-accounts keys list|delete --iam-account=…`, then redo
step 4.
