# DevOps Notes

# Setting up the Prod GKE Environment

# TODO: Reserve Ingress IP and configure DNS

1. Create a zonal cluster. Our Firestore database is in `us-central` so we use the same for GKE. We use a single-node cluster with a shared-core machine for cost:

```sh
NAME=maple
ZONE=us-central1-a
REGION=us-central1
PROJECT=digital-testimony-prod
NUM_NODES=1
MACHINE_TYPE=e2-small
CHANNEL=regular

gcloud container clusters create $NAME \
    --project=$PROJECT \
    --release-channel $CHANNEL \
    --zone $ZONE \
    --node-locations $ZONE \
    --machine-type $MACHINE_TYPE \
    --num-nodes $NUM_NODES
```

2. Point `kubectl` at the cluster:

```sh
# get the name of the cluster context
kubectl config get-contexts
# set the cluster context
kubectl config use-context gke...
```

3. Install [Traefik for ingress and SSL](https://doc.traefik.io/traefik/getting-started/install-traefik/#use-the-helm-chart):

```sh
cd infra
helm repo add traefik https://helm.traefik.io/traefik
helm install --values k8s/traefik.values.yml traefik traefik/traefik
```

3. Install the [local path provisioner](https://github.com/rancher/local-path-provisioner). This is used to create persistent volumes on the node's boot drive for cost:

```sh
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.22/deploy/local-path-storage.yaml
```

4. Decrypt local secrets:

```sh
git secret reveal
```

5. Deploy Typesense:

```sh
cd infra
kubectl apply -f k8s/typesense.yml -f k8s/typesense-secrets.prod.yml
```
