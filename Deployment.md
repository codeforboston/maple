# Deployment

The site runs on Firebase and Kubernetes and is deployed using Github Actions. The dev site is deployed automatically whenever we push to the `master` branch. The prod site is deployed whenever we push to the `prod` branch. Deployments should "just work" but if the site isn't updating, check the status of the deployment action.

- Development Environment
  - [Frontend Deployment Workflow](https://github.com/codeforboston/advocacy-maps/actions/workflows/deploy-frontend-dev.yml)
  - [Backend Deployment Workflow](https://github.com/codeforboston/advocacy-maps/actions/workflows/deploy-backend-dev.yml)
  - [Console](https://console.firebase.google.com/u/0/project/digital-testimony-dev/)
- Production Environment
  - [Deployment Workflow](https://github.com/codeforboston/advocacy-maps/actions/workflows/deploy-prod.yml)
  - [Console](https://console.firebase.google.com/u/0/project/digital-testimony-prod/)

## Firebase

Firebase services are deployed automatically using Github Actions. To deploy manually, run `yarn deploy:backend:dev` or `yarn deploy:backend:prod`

### Environment Configuration

Follow these steps before deploying to a new environment:

1. Enable CORS access for storage bucket with `yarn enable-cors-$environment` from the functions directory.
2. Configure the Typesense api key. Copy it from the Kubernetes secret and set it in Firebase with `yarn firebase functions:secrets:set TYPESENSE_API_KEY`

## One-offs

To perform a migration or run batch scripts, you can either create and deploy a cloud function, then call it manually, or run the code on your local machine with the appropriate credentials for the environment.

To run on your local machine, first acquire a credentials file to grant access to the project. Ask alexjball@ or [create a new key for one of the service accounts](https://cloud.google.com/docs/authentication/production#create_service_account). Then, use the `firebase-admin` tool to access the project and run scripts.

For example, to set the role for a particular user by email, run this:

```sh
yarn firebase-admin \
    -e dev \
    -c ~/path/to/credentials.json \
  run-script setRole \
    --email=me@alexjball.com \
    --role=admin
```

## Typesense

The typesense server is deployed to a kubernetes cluster using the files in `infra/k8s`. To change deployment settings, modify the config files and re-deploy them.

Currently, the dev environment runs on my computer in a single-node [`k3s`](https://github.com/alexellis/k3sup) cluster, and the config files are written for that environment. It uses `traefik` for ingress.

### Typesense API Keys

Clients authenticate with the typesense server using API keys. We have one master key for updating collections and one key that only allows searching for use in the browser.

The master key is stored in a kubernetes secret resource, which is encrypted and checked-in to the repo using [git-secret](https://git-secret.io/).

### Deployment Steps

1. Configure your `kubectl` for cluster access. Ask alexjball@ for credentials.
2. Install `git-secret` and ensure your GPG keys are granted access to the secrets. Ask alexjball@ for access.
3. Decrypt secrets with `git secret reveal`
4. Apply the configuration with `kubectl apply -R -f infra/k8s`
5. Trigger a search index upgrade check. Post a pubsub message with the content `{"check": true}` to the `checkSearchIndexVersion` topic:

```sh
gcloud --project digital-testimony-dev pubsub topics publish checkSearchIndexVersion --message='{"check": true}'
```

6. Generate a search-only API key for use in the browser:

```sh
yarn typesense-admin -e dev create-search-key
```
