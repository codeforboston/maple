# Subscription Functions Documentation

The subscription feature is responsible for following orgs and bills, and these are stored in their activeTopicSubscriptions collection. This is achieved through a series of helper functions which interact with the Firestore database.

Populates activeTopicSubscriptions collection for each user with events from the events collection, which currently contains events only from the MA legislature via the scraper utility (see /maple/functions/src/events/scrapeEvents.ts)

The metadata for the different types of documents (bills and orgs) is important, as the fields will need to match the user's subscriptions. This is currently handled by the

If an event has certain fields that correspond to fields in the uesr's subscriptions, then the user will receive a notification by in the notificationFeed by way of the notifications cloud functions

## Following Orgs

- orgLookup
- - fullName
- - profileId
- relatedBills

## Following Bills

- billLookup
- - billId
- - court
- relatedOrgs

## Testing

To test these functions in a container environment, use the following command:

\`\`\`bash
yarn firebase-admin -e local run-script <name-of-script>
\`\`\`
