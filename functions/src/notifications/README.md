# Notification Functions Documentation

## Overview

The notification feature is responsible for sending notifications to users based on their subscribed topics. This is achieved through a series of cloud functions written in TypeScript and deployed to Firebase Cloud Functions. These functions are triggered by events in the database and operate on a publication schedule.

## Features

- **Topic-Based Notifications**: Users receive notifications based on topics they are subscribed to.
  - Each user has a list of topics created when subscribing to a Bill, User, or Organization.
  - Topics can be categorized as either Bill Topics or Organization Topics:
    - `bill-[courtId]-[billId]`: Triggers when a subscribed Bill has a history update or when testimony is posted on the Bill.
    - `testimony-[userId]`: Triggers when a subscribed User or Organization posts testimony.
- **Notification Events**
  - A BillHistoryNotificationEvent is created when a subscribed Bill has an updated history
  - A TestimonySubmissionNotificationEvent is created when a subscribed Bill has testimony published and when a Organization/User publishes testimony
- **Event Triggers**: Functions are triggered based on changes in the `notificationEvents` collection

## Architecture

### Notification Events

A user could be subscribed to a given topic, and receive a notification of a bill or profile (such as an organization) that fall under that topic have an event.

Example event regarding a bill history update:
![example-bill-notification-event](/functions/src/notifications/images/example-bill-notification-event.png)

Example event regarding an testimony:
![example-testimony-notification-event](/functions/src/notifications/images/example-testimony-notification-event.png)

### Cloud Functions

The following cloud functions are involved in the notification process:

1. **populateBillHistoryNotifictionEvents** and **populateTestimonySubmissionNotificationEvents**:

   - Creates/Updates a notificationEvent document when:
     - A Bill is created or updated, if the history is updated, it will update the notificationEvent history and not create a new one.
     - Testimony is published or updated, if the testimony content is updated, it will update the notificationEvent testimony content an not create a new one.

2. **publishNotifications**:

   - Creates a notification document from an notification event.
   - Populates the user's `userNotificationFeed` collection with a notification document.
   - Populates the newsfeed.

   For example, here is a notification document in a given user's feed:

![example-bill-history-update-notification](/functions/src/notifications/images/example-bill-history-update-notification.png)

- There are two key fields to differentiate whether a notification came from following a bill or following a user/organization:
  - `isBillMatch` and `isUserMatch` indicate the source of the notification.
    - For example, if a user follows both a bill and an organization, and the organization posts testimony to that same bill, both `isBillMatch` and `isUserMatch` will be true.
    - If a user follows only the bill and not the organization, `isBillMatch` will be true and `isUserMatch` will be false, and vice versa.

3. **deliverNotifications**:

   - Sends notifications to users who have a `notificationFrequency` of 'daily' and whose `nextDigestAt` is less than or equal to the current time.
   - Populates the `emails` collection with a notification document.

4. **cleanUpNotifications**:
   - Removes notifications from the users' userNotificationFeed collection that are older than 60 days.
   - Removes notifications from the notificationEvents collection that are older than 60 days.
   - Removes notifications from the emails collection that are older than 60 days.

### Database Collections

- `activeTopicSubscriptions`: Stores the active topic subscriptions for users.
- `emails`: Stores the notification mails sent to users.
- `notificationEvents`: Stores the events that trigger notifications.
- `userNotificationFeed`: Stores the notifications for each user

### Query Logic

Queries the `subscriptions` collection for users that have a `notificationFrequency` of 'daily' and whose `nextDigestAt` is less than or equal to the current time.

## Testing

To test these functions in a container environment, use the following command:

```bash
yarn firebase-admin -e local run-script <name-of-script>
```

or to test the notifications as a whole

```bash
yarn test:integration notifications.test.ts
```

## Future Considerations

- `publishNotifications` currently listens to the `notificationEvents` collection but could be extended to include other collections.
- Formatting of fields may need to be changed if scraping of hearings is included.

## References

- [GitHub Issue for Notifications](https://github.com/codeforboston/maple/issues/952)
