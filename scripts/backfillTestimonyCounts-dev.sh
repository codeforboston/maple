curl \
  --get \
  --data-urlencode 'data={"run":true}' \
  --data-urlencode 'pubsub=backfillTestimonyCounts' \
  http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction