import * as functions from "firebase-functions/v1"
import { onCall, CallableRequest } from "firebase-functions/v2/https"
import { checkAuth, checkAdmin } from "../common"
import { db } from "../firebase"
import { SpecialEventsScraper, SessionScraper } from "./EventScraper"
import { HearingScraper, HearingPostProcessor } from "./HearingScraper"

/**
 * Callable cloud function to scrape a single hearing by EventId.
 * Requires authentication to prevent abuse of API call limits.
 *
 * @param data - Object containing the EventId (e.g., 1234)
 * @param context - Firebase callable context with auth information
 */
export const scrapeSingleHearing = functions
  .runWith({
    timeoutSeconds: 480,
    secrets: ["ASSEMBLY_API_KEY"],
    memory: "4GB"
  })
  .https.onCall(async (data: { eventId: number }, context) => {
    // Require admin authentication
    checkAuth(context, false)
    checkAdmin(context)

    const { eventId } = data

    if (!eventId || typeof eventId !== "number") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid eventId (number)."
      )
    }

    try {
      const hearing = {
        ...(await new HearingScraper().getEvent({ EventId: eventId })),
        ...(await new HearingPostProcessor().getUpdate({ EventId: eventId })) // Videos
      }

      // Save the hearing to Firestore
      await db.doc(`/events/${hearing.id}`).set(hearing, { merge: true })

      console.log(`Successfully scraped hearing ${eventId}`, hearing)

      return {
        status: "success",
        message: `Successfully scraped hearing ${eventId}`,
        hearingId: hearing.id
      }
    } catch (error: any) {
      functions.logger.error(`Failed to scrape hearing ${eventId}:`, error)
      throw new functions.https.HttpsError(
        "internal",
        `Failed to scrape hearing ${eventId}`,
        { details: error.message }
      )
    }
  })

export const scrapeSingleHearingv2 = onCall(
  { timeoutSeconds: 480, memory: "4GiB", secrets: ["ASSEMBLY_API_KEY"] },
  async (request: CallableRequest) => {
    // Require admin authentication
    // Check how to integrate the new object with these helper functions
    checkAuth(request, false)
    checkAdmin(request)

    const { eventId } = request.data

    if (!eventId || typeof eventId !== "number") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid eventId (number)."
      )
    }

    try {
      const hearing = {
        ...(await new HearingScraper().getEvent({ EventId: eventId })),
        ...(await new HearingPostProcessor().getUpdate({ EventId: eventId }))
      }

      // Save the hearing to Firestore
      await db.doc(`/events/${hearing.id}`).set(hearing, { merge: true })

      console.log(`Successfully scraped hearing ${eventId}`, hearing)

      return {
        status: "success",
        message: `Successfully scraped hearing ${eventId}`,
        hearingId: hearing.id
      }
    } catch (error: any) {
      functions.logger.error(`Failed to scrape hearing ${eventId}:`, error)
      throw new functions.https.HttpsError(
        "internal",
        `Failed to scrape hearing ${eventId}`,
        { details: error.message }
      )
    }
  }
)

export const scrapeSpecialEvents = new SpecialEventsScraper().function
export const scrapeSessions = new SessionScraper().function
export const scrapeHearings = new HearingScraper().function
export const scrapeVideos = new HearingPostProcessor().function
