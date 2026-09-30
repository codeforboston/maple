# ADR 0001: atproto infrastructure on GCP

- **Status:** Accepted
- **Date:** 2026-08-25

## Context

atproto phase 1 puts MAPLE's legislative data on a PDS: a long-lived, stateful service
(SQLite on local disk, plus a blobstore). MAPLE's application state and backend compute
live in the Firebase projects `digital-testimony-dev` and `digital-testimony-prod`. The
only other infrastructure is Typesense on AWS, managed from a repo this team cannot write
to, deployed to dev and prod together with no gate, unchanged since June 2023.

We hold `roles/editor` on dev and nothing on prod; prod waits on a handoff to the upstream
maintainers.

## Decision

New atproto infrastructure runs in the existing GCP projects, one environment per project,
defined as Terraform in this repo under `infra/gcp`. Terraform owns only the atproto
resources; Firestore, Cloud Functions and Firebase extensions stay with the `firebase`
CLI. Secret values are never Terraform inputs: state stores them in plaintext, so they are
added out of band.

The PDS is a Compute Engine VM running the reference `bluesky-social/pds` image, its data
on a persistent disk, blobs in a Cloud Storage bucket. The PDS expects a POSIX filesystem
for SQLite, and Bluesky's installer targets exactly this shape.

## Consequences

- Production is a reviewable `terraform apply` run by an owner, not a request for owner
  access for an outside contributor.
- Dev and prod are the same module with different variables.
- We patch a VM. A managed PDS would absorb that at the cost of custody of the data and
  keys.
- Terraform is a second IaC tool beside the AWS CDK; that stack is AWS-only and
  unmaintained.

## Alternatives

- **The AWS ECS cluster.** Not writable by this team, no dev/prod gate, non-durable
  storage, unmaintained.
- **Cloud Run for the PDS.** No block storage; SQLite over GCS FUSE or Filestore is
  unsafe.
- **GKE.** More moving parts than one small service justifies.
- **A managed PDS.** Gives up custody of data and signing keys for a project whose point
  is custody of public records.
- **Hand-run `gcloud` commands.** Makes production an access request rather than a
  reviewable plan, and drifts from what is deployed.
