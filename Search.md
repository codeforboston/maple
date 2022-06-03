# Search using Typesense

As a user, I want to be able to search bills, testimony, and other content so that I can better understand and participate in the Massachusetts state political process.

# The Problem

Our database, Firestore, does not support full-text search, nor does it provide flexible sorting and fitlering of documents.

# The Solution

We will use [Typesense](https://typesense.org/) to provide full-text search of our data and to generate filtered views of our data.

Other options include Elasticsearch, Solr, and Algolia. Elasticsearch and Solr are very flexible but have a high learning curve and maintenance burden. Algolia is easier to adopt, but it is a paid, proprietary service that can get expensive. Typesense is an open-source server designed to be easy to use like Algolia but can be self-hosted.

# The Plan

- Run our own instance of Typesense in the cloud using Kubernetes.
- Sync our Firestore documents to Typesense using cloud functions.
- Update the frontend to query the Typesense server.

# Syncing Firestore Documents

Whenever a document changes, we need to upload it to the search service so it can be indexed. We can use Firestore function triggers to respond to document changes. Additionally, we need to backfill the search index initially to pick up the current state of all documents.

Typesense organizes documents into collections, and requires us to specify the structure of each collection in a [schema](https://typesense.org/docs/0.22.2/api/collections.html#with-pre-defined-schema) when we create them. Collection schemas cannot be altered, so when we change the fields we want to search on, we need to update the schema, create a new collection with that schema, and rerun the backfill operation to populate the index. Fortunately, we can use [collection aliases](https://typesense.org/docs/0.22.2/api/collection-alias.html) to provide a consistent name for the frontend to use for the collection, so updating the collection only requires changes on the backend. We will automate this process.

# Design

We will add 3 types of cloud functions:

- `checkSearchIndexVersion`: This runs after each deployment. For each collection, it compares a hash of the schema to the version of the alias in Typesense. If they differ, it triggers a schema upgrade. It is triggered using a Pub/Sub topic that we publish to from our Github Actions deployment workflow.
- `upgrade(Bill)SearchIndex`: This upgrades the search index schema for a single collection, such as `bills` or `testimony`. It bulk-upserts all documents from the Firestore collection into the new Typesense collection, then updates the alias to point to the new Typesense collection. It is triggered by document creation on a specific collection, similar to scraper batches.
- `sync(Bill)ToSearchIndex`: This upserts or deletes an individual document into the current Typesense collection and is triggered on writes to the Firestore collection. It only upserts the document if the indexed fields change.
