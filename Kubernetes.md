# Kubernetes Notes

These steps require the `kubectl`, `helm`, `gcloud`, and `git secret` tools and a unix environment. First, authenticated with gcloud and select the project you want to deploy to:

```sh
PROJECT_ID=digital-testimony-prod
gcloud auth login
gcloud config set project $PROJECT_ID
```

Now decrypt secrets so they can be deployed to Kubernetes, or create your own if you're not authorized (ask @alexjball for access):

```
git secret reveal
```

Finally, point your `kubectl` at the cluster using the context set up by `gcloud`:

```sh
# get the name of the cluster context
kubectl config get-contexts
# set the cluster context
kubectl config use-context gke...
```

# Environments

Currently there are two environments, `dev` and `prod`, which I'll refer to as `$ENV`. `prod` is configured to run in Google Kubernetes Engine and `dev` is configured to run on my home server using `k3s` with the built-in traefik deployment disabled.

# Setting up a new GKE environment

1. Create a zonal cluster

Our Firestore database is in `us-central` so we use the same for GKE. We use a single-node cluster with a shared-core machine for cost:

```sh
NAME=maple
ZONE=us-central1-a
REGION=us-central1
PROJECT=digital-testimony-prod
NUM_NODES=1
MACHINE_TYPE=e2-small
DISK_SIZE=10
CHANNEL=regular

gcloud container clusters create $NAME \
    --project=$PROJECT \
    --release-channel $CHANNEL \
    --zone $ZONE \
    --node-locations $ZONE \
    --machine-type $MACHINE_TYPE \
    --disk-size $DISK_SIZE \
    --num-nodes $NUM_NODES
```

2. [Reserve a regional IP address](https://cloud.google.com/kubernetes-engine/docs/tutorials/configuring-domain-name-static-ip#use_a_service) that will accept all external traffic:

```
gcloud compute addresses create maple-ingress --region us-central1
```

Then assign the address to the cluster node following [these](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address#IP_assign) instructions. You can also reserve the IP assigned when the VM starts through the console.

3. Allow ports 80 and 443 through the firewall:

```sh
gcloud compute firewall-rules create maple-ingress --allow tcp:80,tcp:443
```

4. Configure DNS for your domain. Create an `A Record` with the value of the IP you reserved. See [these instructions for Google Domains](https://support.google.com/domains/answer/3290350?hl=en#zippy=%2Cadd-a-resource-record).

# Configuring the deployment

Deployments are configured using Kubernetes resources in the `infra` folder. We have one helm chart that builds the resources, and each environment has a `kustomization` file to configure values for the specific environment.

1. Use `kubectl config use-context` to select the appropriate cluster

2. Update the values in `infra/$ENV/kustomization.yml` as needed. In particular, the domain you set up DNS for needs to be the `apiDomain` value for the helm chart.

# Deploying to a Kubernetes cluster

1. Select your cluster with `kubectl config use-context $MY_CONTEXT`
2. Build the resource files with `infra/release.sh $ENV build`
3. Inspect changes to the `dist.yml` file and commit the changes
4. Deploy the app with `infra/release.sh $ENV deploy`
