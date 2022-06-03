curl \
  --get \
  --data-urlencode 'data={"check":true}' \
  --data-urlencode 'pubsub=checkSearchIndexVersion' \
  http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction