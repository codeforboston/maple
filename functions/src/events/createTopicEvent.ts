import { Database } from '../types';

export const createTopicEvent = async (
  db: Database,
  eventData: any // Replace 'any' with the appropriate type for your eventData
) => {
  const eventsRef = db.collection('events');
  await eventsRef.add(eventData);
};
