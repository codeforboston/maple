#!/bin/bash

cd $(dirname $0)

ENV="${1:?Need to specify environment}"
CMD="${2:?Need to specify operation}"
shift 2

function check_dist_committed() {
  if [ -n "$(git status --porcelain $ENV/dist.yml)" ]; then 
    echo "Please commit changes to $ENV/dist.yml"
    exit 1
  fi
}

function confirm_context() {
  CTX=$(kubectl config current-context)
  read -p "Deploy to context $CTX? (y/n) "
  if [ "$REPLY" != "y" ]; then
    echo "Not deploying"
    exit
  fi
}

case $CMD in
  build)
    kustomize build \
        --enable-helm \
        --load-restrictor=LoadRestrictionsNone \
        $ENV > $ENV/dist.yml
    ;;

  deploy)
    check_dist_committed
    confirm_context
    kubectl apply -f $ENV/dist.yml
    ;;

  delete)
    check_dist_committed
    echo Type \"delete\" to delete this env
    read confirm
    if [ "$confirm" == "delete" ] 
      then
        kubectl delete -f $ENV/dist.yml
    fi
    ;;

  help|*)
    echo "Usage: release.sh (dev|prod) (build|deploy|delete)"
    ;;
esac
