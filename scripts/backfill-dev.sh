HOST=${FIREBASE_HOST:-localhost}

curl \
  --get \
  --data-urlencode 'data={"check":true}' \
  --data-urlencode 'pubsub=checkSearchIndexVersion' \
  http://$HOST:5001/demo-dtp/us-central1/triggerPubsubFunction