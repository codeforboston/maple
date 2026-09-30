# atproto PDS on GCP

One Terraform root, one state per environment (`envs/<env>.*`), applied as a whole. Applies are
human-run; CI only plans. What is in here and why: [DESIGN.md](DESIGN.md). The decision:
[ADR 0001](../../docs/adr/0001-atproto-infra.md).

## Permissions

- **The environment's project**: `roles/editor` for every step, plus `roles/owner` for the grants
  in `iam.tf` — an editor's apply ends red on those alone, and an owner's apply afterwards plans
  exactly them (`iam.tf` says why).
- **`digital-testimony-prod`**: `roles/dns.admin` for the NS record in the parent zone, and at
  least `roles/dns.reader` or nothing here plans. `roles/owner` there only for CI ([CI.md](CI.md)).

## Apply

`infra/gcp/dns` must be applied and live at the registrar first — this root looks its zone up, and
until the delegation resolves Caddy cannot get a certificate however healthy `pds-startup` looks:
[dns/README.md](dns/README.md). `pds_hostname` is apply-once (`variables.tf`).

```sh
infra/gcp/scripts/bootstrap.sh dev                              # 1. APIs and the state bucket
terraform -chdir=infra/gcp init -backend-config=envs/dev.gcs.tfbackend
terraform -chdir=infra/gcp apply -var-file=envs/dev.tfvars      # 2. everything in Cost, below
infra/gcp/scripts/secrets.sh dev                                # 3. secret versions and the blob HMAC key; never rotates
curl https://pds-dev.mapletestimony.org/xrpc/_health            # green within 3 min of step 2
gcloud storage ls gs://digital-testimony-dev-atproto-pds-blobs/  # after one uploadBlob lands
```

Then delete the record that blob belonged to: the object must leave the bucket. That is the one
blobstore call the first apply has to prove; if it stays, `docker compose logs pds | grep 'could
not delete blobs'` is the trail. If health never goes green, read the serial console with
`gcloud compute instances get-serial-port-output atproto-pds --zone=us-central1-a`. Not applied
here: secret versions and the HMAC key (step 3), the state bucket (step 1). Prod: same with `prod`.

## Rollback

- **Config**: revert and apply. A startup-script change lands on the next boot;
  `gcloud compute instances reset atproto-pds --zone=us-central1-a` applies it now.
- **A secret**: `gcloud secrets versions add <id> --data-file=-`, then reset the VM or re-run
  `sudo google_metadata_script_runner startup` over IAP ssh. Either re-reads every secret and
  restarts the PDS; nothing is on disk. Disable the old version.
- **Data**: create a disk from a snapshot, attach it as `pds-data`; blobs are in the bucket. State:
  the bucket is versioned, restore the earlier object.
- **Teardown**: `destroy` refuses by design — `prevent_destroy` on the durable resources, and the
  VM is deletion-protected. Lifting those is its own reviewed change.

## Monitoring

Alerts go to `alert_channels` in `envs/<env>.tfvars`, subjects prefixed `[<env>]`; thresholds are
in `monitoring-pds.tf` and each page carries its own first step. Prove the channel once per
environment: ssh in, `sudo systemctl stop pds.service`, wait for the page (≤ 6 min), `start` it.
Expect one during bring-up; that page is the test.

## Cost

| Resource                                |        dev |       prod |
| --------------------------------------- | ---------: | ---------: |
| `e2-small`, 730 h                       |     $12.23 |     $12.23 |
| Balanced PD, 30 GiB (10 boot + 20 data) |      $3.00 |      $3.00 |
| Static external IP, attached            |      $3.65 |      $3.65 |
| Cloud DNS, one managed zone             |      $0.20 |      $0.20 |
| **Total**                               | **$19.08** | **$19.08** |

Excluded because they scale with use: snapshots ($0.05/GiB-month retained), blobs
($0.020/GiB-month, 5 GiB free, nothing prunes them), DNS queries ($0.40/million), egress. Too
small to table: Secret Manager, the uptime check, alert policies, firewall, service accounts, IAM.
List prices, us-central1, read 2026-09-21 from the Cloud Billing Catalog API; E2 earns no
sustained-use discount. Prod is a projection: unapplied, and `alert_channels` is unset there.

## CI

`.github/workflows/terraform-checks.yml`: `fmt`, `validate` and an advisory dev plan on PRs. What
runs, and the one-time setup it needs: [CI.md](CI.md).
