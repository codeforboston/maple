# Notification Functions Documentation

## Overview

The notification feature is responsible for sending notifications to users based on their subscribed topics. This is achieved through a series of cloud functions written in TypeScript and deployed to Firebase Cloud Functions. These functions are triggered by events in the database and operate on a publication schedule.

## Features

- **Topic-Based Notifications**: Users receive notifications based on topics they are interested in.
- **Scheduled Triggers**: Functions are triggered based on a publication schedule.
- **Multi-Environment Support**: Both HTTP callable and pubSub versions of functions are available for testing and production, respectively.

## Architecture

### Cloud Functions

The following cloud functions are involved in the notification process:

1. **publishNotifications**:

   - Creates a notification document from an event.
   - Populates the user's `userNotificationFeed` collection with a notification document.
   - Populates the newsfeed.

2. **deliverNotifications**:

   - Sends notifications to users who have a `notificationFrequency` of 'daily' and whose `nextDigestAt` is less than or equal to the current time.
   - Populates the `notification_mails` collection with a notification document.

3. **cleanUpNotifications**:
   - Removes notifications from the users' userNotificationFeed collection that are older than 60 days.
   - Removes notifications from the events collection that are older than 60 days.
   - Removes notifications from the notifications_mails collection that are older than 60 days.

### Database Collections

- `activeTopicSubscriptions`: Stores the active topic subscriptions for users.
- `notification_mails`: Stores the notification mails sent to users.
- `events`: Stores the events that trigger notifications.

### Query Logic

Queries the `subscriptions` collection for users that have a `notificationFrequency` of 'daily' and whose `nextDigestAt` is less than or equal to the current time.

## Testing

To test these functions in a container environment, use the following command:

\`\`\`bash
yarn firebase-admin -e local run-script <name-of-script>
\`\`\`

## Future Considerations

- `publishNotifications` currently listens to the `events` collection but could be extended to include other collections.
- Formatting of fields may need to be changed if scraping of hearings is included.

## References

- [GitHub Issue for Notifications](https://github.com/codeforboston/maple/issues/952)
