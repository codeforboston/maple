# infra/gcp: design

How to apply it is [README.md](README.md). The decision is
[ADR 0001](../../docs/adr/0001-atproto-infra.md). This file is what the root contains and why
each piece is shaped that way — the context you want before reading the HCL, not a second copy
of it. `terraform state list` is the inventory; the cost table in the README is the list of
things that bill.

## The boundary

Terraform owns the atproto resources and nothing else. Firestore, Cloud Functions and the
Firebase extensions stay with the `firebase` CLI, because they were there first and a second
owner for them would mean two tools racing over the same project.

Secret **values** are never Terraform inputs: state stores them in plaintext, so the root creates
empty Secret Manager secrets and a human adds versions out of band. The same rule sends the
bucket's HMAC key to `scripts/secrets.sh` and the state bucket itself to `scripts/bootstrap.sh`,
which is why the apply is not self-sufficient and the README names what it leaves out.

Editors can plan everything and apply almost everything; the IAM grants need an owner. That split
is deliberate — it means a contributor can propose infrastructure without holding the rights to
grant themselves more.

## The PDS

A Compute Engine VM running the reference `bluesky-social/pds` image under docker compose, with
Caddy in front for TLS. It is a VM rather than a container service because the PDS keeps SQLite
and an actor store on a POSIX filesystem; SQLite over GCS FUSE or Filestore is not safe, and
Bluesky's own installer targets exactly this shape.

Its state is split three ways on purpose. The **data disk** holds SQLite and the actor store and
is what gets snapshotted. **Blobs** — uploaded media, content-addressed — go to a Cloud Storage
bucket through the S3-compatible API, so the disk does not grow with uploads and does not need
resizing as the repo fills. **Secrets** are rendered into `/run` (tmpfs) on every boot, so they
are never on the data disk and never in a snapshot of it.

The hostname is apply-once. It lands in the DID document of every account the PDS creates, so
changing it later does not rename the service, it orphans the identities.

## DNS

The delegated zone (`pds.` or `pds-dev.`) is created here, and the NS record that delegates it
lives in the parent zone in the prod project — which is why every plan, in both environments,
reads across into prod and needs at least `dns.reader` there.

The parent zone itself is a **separate root**, `infra/gcp/dns`, with its own state and its own
[README](dns/README.md). It is shared by everything at `mapletestimony.org`, not just atproto,
and it was cut over from another registrar on its own schedule; folding it in here would have
coupled that cutover to this service's applies.

## Monitoring

Three alerts, and a deliberate view of what an alert can carry. Each policy's `documentation`
holds its own first step, because that is what reaches a pager at 3am. The README's Monitoring
section holds what a page cannot: how to prove the channel actually delivers, and what is not
watched yet. Thresholds live in the HCL and are not restated anywhere.

Alert channels are per environment so dev can never page whoever is on call for prod, and the
channel types are restricted to the ones whose configuration holds no secret — a PagerDuty
service key or Slack token would land in state, which the boundary above forbids.
