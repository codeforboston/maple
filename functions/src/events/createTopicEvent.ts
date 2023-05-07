import { Database } from '../types';

export const createTopicEvent = async (
  db: Database,
  eventData: any // Replace 'any' with the appropriate type for your eventData
) => {
  const topicEventsRef = db.collection('topicEvents');
  await topicEventsRef.add(eventData);
};
