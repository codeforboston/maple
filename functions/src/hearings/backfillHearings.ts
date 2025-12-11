import * as functions from "firebase-functions"
import { Number, Record, Union } from "runtypes"
import { getEvent, listEvents } from "../events"
import { db } from "../firebase"
import { logFetchError } from "../common"
import { DateTime } from "luxon"

const EventIdHearingRequest = Record({
  EventId: Number
})
const cutoffDaysHearingRequest = Record({
  cutoffDays: Number
})

const backfillHearingRequest = Union(
  EventIdHearingRequest,
  cutoffDaysHearingRequest
)

export const backfillHearingTranscription = functions.https.onCall(
  async data => {
    const checked = backfillHearingRequest.check(data)
    if ("EventId" in checked) {
      const event = await getEvent({ EventId: checked.EventId })
      if (!event) {
        throw new functions.https.HttpsError(
          "not-found",
          `Event with ID ${checked.EventId} not found`
        )
      }
      console.log(`Backfilling event ${event.id}`)
      await db.doc(`/events/${event.id}`).set(event, { merge: true })
      return { success: true, eventId: event.id }
    } else if ("cutoffDays" in checked) {
      const cutoffDays = checked.cutoffDays
      const list = await listEvents().catch(logFetchError("event list"))

      if (!list) return

      const writer = db.bulkWriter()
      const upcomingOrRecentCutoff = DateTime.now().minus({ days: cutoffDays })
      let processedCount = 0

      for (let item of list) {
        const id = (item as any)?.EventId,
          event = await getEvent(item).catch(logFetchError("event", id))

        if (!event) continue
        if (event.startsAt.toMillis() < upcomingOrRecentCutoff.toMillis()) break

        writer.set(db.doc(`/events/${event.id}`), event, { merge: true })
        console.log(`Backfilling event ${event.id}`)
        processedCount++
      }
      await writer.close()

      return { success: true, processedCount }
    } else {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid request data"
      )
    }
  }
)

export const backfillHearingTranscriptionHttp = functions.https.onRequest(
  async (req, res) => {
    try {
      const checked = backfillHearingRequest.check(req.body)
      if ("EventId" in checked) {
        try {
          const event = await getEvent({ EventId: checked.EventId })
          if (!event) {
            res
              .status(404)
              .send({ error: `Event with ID ${checked.EventId} not found` })
            return
          }
          console.log(`Backfilling event ${event.id}`)
          await db.doc(`/events/${event.id}`).set(event, { merge: true })
          res.status(200).send({ eventId: event.id })
        } catch (error) {
          console.error("Error fetching event:", error)
          res.status(500).send({ error: "Error fetching event" })
        }
      } else if ("cutoffDays" in checked) {
        const cutoffDays = checked.cutoffDays
        const list = await listEvents().catch(logFetchError("event list"))

        if (!list) {
          res.status(404).send({ error: "No events found" })
          return
        }

        const writer = db.bulkWriter()
        const upcomingOrRecentCutoff = DateTime.now().minus({
          days: cutoffDays
        })
        let processedCount = 0

        for (let item of list) {
          const id = (item as any)?.EventId,
            event = await getEvent(item).catch(logFetchError("event", id))

          if (!event) continue
          if (event.startsAt.toMillis() < upcomingOrRecentCutoff.toMillis())
            break

          writer.set(db.doc(`/events/${event.id}`), event, { merge: true })
          console.log(`Backfilling event ${event.id}`)
          processedCount++
        }
        await writer.close()

        res.status(200).send({ processedCount })
      } else {
        res.status(400).send({ error: "Invalid request data" })
      }
    } catch (err) {
      res.status(400).send({ error: err || "Invalid request" })
    }
  }
)
