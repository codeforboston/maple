# atproto PDS on GCP

One Terraform root, one state per environment (`envs/<env>.*`). Applies are human-run; CI only
plans. Design: [ADR 0001](../../docs/adr/0001-atproto-infra.md).

## Permissions

- **The environment's project**: `roles/editor` for every step (it carries `storage.hmacKeys.*`
  for step 3). `roles/owner` for the grants in `iam.tf`: an editor's apply ends red on the grants
  only, and an owner's apply afterwards plans exactly those.
- **`digital-testimony-prod`**: `roles/dns.admin` for the NS record in the parent zone. Every plan
  reads that zone, so without at least `roles/dns.reader` nothing plans. `roles/owner` there only
  for the CI planner's zone-reader grant in `iam.tf` ([CI.md](CI.md)).

## Apply

`infra/gcp/dns` is applied first (this root looks its zone up) and must be live at the registrar
(`dig +short NS mapletestimony.org` returns Cloud DNS name servers): until then nothing here
resolves and Caddy cannot get its certificate, however healthy `pds-startup` looks in the serial
console. The hostname is apply-once (it lands in the DID document of every account the PDS
creates).

```sh
infra/gcp/scripts/bootstrap.sh dev                              # 1. APIs and the state bucket
terraform -chdir=infra/gcp init -backend-config=envs/dev.gcs.tfbackend
terraform -chdir=infra/gcp apply -var-file=envs/dev.tfvars       # 2. everything below
infra/gcp/scripts/secrets.sh dev                                 # 3. the five secret versions; never rotates
curl https://pds-dev.mapletestimony.org/xrpc/_health             # the VM starts the PDS within 3 min
gcloud storage ls gs://digital-testimony-dev-atproto-pds-blobs/   # done once one uploadBlob lands here
gcloud compute instances get-serial-port-output atproto-pds --zone=us-central1-a | grep pds-startup   # if not
```

Then delete the record that blob belonged to: the object should leave the bucket. If it stays,
`docker compose logs pds | grep 'could not delete blobs'` on the box is the trail — the PDS's batch
delete carries a checksum header GCS's S3 API may not accept (`pds-startup.sh.tftpl`); this is the
one blobstore call the first deploy has to prove.

Prod: the same with `prod`.

## What gets applied

A static IP and firewall (80/443 open, 22 via IAP); the `atproto-pds` VM with a 20 GB data disk
snapshotted daily for 14 days; the delegated zone, its A record and the parent NS record; five
Secret Manager secrets without versions; the blob bucket; the VM's service account and its
grants. Knobs: `envs/<env>.tfvars`. Not here: secret versions and the HMAC key (`secrets.sh`),
the state bucket (`bootstrap.sh`).

## Rollback

- **Config**: revert and apply. A startup-script change lands on the next boot:
  `gcloud compute instances reset atproto-pds --zone=us-central1-a` applies it now.
- **A secret**: `gcloud secrets versions add <id> --data-file=-`, then re-run the startup script
  (`gcloud compute ssh atproto-pds --tunnel-through-iap --zone=us-central1-a -- sudo google_metadata_script_runner startup`)
  or reset the VM; either re-reads every secret and restarts the PDS, nothing is on disk. Disable
  the old version.
- **Data**: create a disk from a snapshot and attach it as `pds-data`. Blobs are in the bucket.
- **State**: the bucket is versioned; restore the earlier object.
- **Teardown**: `destroy` refuses by design (`prevent_destroy` on disk, bucket and zone; the VM
  is deletion-protected). Lifting those is its own reviewed change.

## CI

`.github/workflows/terraform-checks.yml`: `fmt`, `validate` and an advisory dev plan on PRs. What
runs, and the one-time setup the plan needs: [CI.md](CI.md).
