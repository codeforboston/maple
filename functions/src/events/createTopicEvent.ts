import { Database } from "../types"
import { EventData } from "../types"
export const createTopicEvent = async (
  db: Database,
  eventData: EventData
) => {
  const eventsRef = db.collection("events")
  await eventsRef.add(eventData)
}
