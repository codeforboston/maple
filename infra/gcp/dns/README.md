# mapletestimony.org in Cloud DNS

One zone, in `digital-testimony-prod`; dev has no DNS of its own. `zone.tf` is the zone,
`records.tf` every record, `envs/prod.gcs.tfbackend` the state bucket.

## Permissions

- **Squarespace**: the domain login. Steps 1, 4, 5 and 6.
- **GCP**: `roles/editor` on `digital-testimony-prod`. Step 2.
- **Local**: Terraform 1.16, `gcloud` logged in as that account, `dig`, `python3`.

## Switchover

1. **Inventory.** Squarespace → DNS → DNS Settings. Every record there must be in
   `records.tf`; add the missing ones, review, merge.
2. **Build.**

   ```sh
   infra/gcp/scripts/bootstrap.sh prod   # APIs, and the versioned state bucket both roots share
   terraform -chdir=infra/gcp/dns init -backend-config=envs/prod.gcs.tfbackend
   terraform -chdir=infra/gcp/dns apply -var-file=envs/prod.tfvars
   terraform -chdir=infra/gcp/dns output name_servers
   ```

3. **Verify.** With one of the four from step 2:

   ```sh
   infra/gcp/dns/verify.py NEW_NS
   ```

   Exit 0 means every record answers identically at the new and old servers, and the
   old zone holds no name or type `records.tf` lacks. Anything else: fix, apply, rerun.

4. **DNSSEC off.** Squarespace → DNS → DNSSEC → toggle off → Confirm. Do not open the
   name-server screen yet. Wait until this returns nothing, then one more hour:

   ```sh
   dig +short DS mapletestimony.org @a0.org.afilias-nst.info
   ```

5. **Name servers.** Squarespace → DNS → Domain Nameservers → Use Custom Nameservers →
   enter the four from step 2 → Save. Both zones serve identical data during the overlap.
6. **DNSSEC on.** Wait until this shows only the four new name servers, then one more hour:

   ```sh
   dig +norecurse +noall +authority NS mapletestimony.org @a0.org.afilias-nst.info
   ```

   Print the DS record (`outputs.tf` names its four fields):

   ```sh
   terraform -chdir=infra/gcp/dns output ds_record
   ```

   Squarespace → DNS → DNSSEC → Add record, enter them, Save. Done when `ad` appears:

   ```sh
   dig +dnssec A mapletestimony.org @8.8.8.8 | grep "^;; flags:"
   ```

## Rollback

Before step 6: enter `ns-cloud-e1.googledomains.com` through `e4` in Squarespace; the old zone
is still there and still serving. After step 6: delete the DS record, wait an hour, then change
the name servers.

## Cost

One public managed zone, **$0.20/month**, in prod only — too few rows to be worth a table.
Queries add $0.40 per million; DNSSEC signing is free and only makes responses larger; records
inside a zone cost nothing, so the 15 here are free. The PDS zones belong to
[infra/gcp](../README.md). List prices, Cloud Billing Catalog API, 2026-09-21.
