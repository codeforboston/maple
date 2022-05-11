import * as functions from "firebase-functions"
import axiosModule from "axios"
import { JSDOM } from "jsdom"

export type DocEventProperties = {
  ref: FirebaseFirestore.DocumentReference
  type: string
  id: string
  status: string
  eventDetailsScrapeTime: number
}

export const _getDocumentProperties = (
  documentAfterChange: functions.firestore.DocumentSnapshot
): DocEventProperties => {
  const ref = documentAfterChange.ref
  const eventData = documentAfterChange.data()
  const { type } = eventData!
  const {
    EventId: id,
    Status: status,
    eventDetailsScrapeTime
  } = eventData!.content
  return {
    ref,
    type,
    id,
    status,
    eventDetailsScrapeTime
  }
}

export const _wasScrapedRecently = (eventDoc: DocEventProperties) => {
  const eventDetailsScrapeTime = eventDoc.eventDetailsScrapeTime
  const thirtyMins = 30 * 60 * 1000
  const oneHourAgo = Date.now() - 2 * thirtyMins 
  const lastScrapeTime = eventDetailsScrapeTime || oneHourAgo 
  const timeSinceLastScrape = Date.now() - lastScrapeTime
  if (timeSinceLastScrape < thirtyMins) return true
  return false
}

export const _isUpcomingHearing = (eventDoc: DocEventProperties): boolean => {
  return eventDoc.type !== "hearing" || eventDoc.status === "Completed"
}

export const _fetchEventPageDom = async (eventId: string) => {
  const axios = axiosModule.create({
    baseURL: "https://malegislature.gov",
    timeout: 5000
  })

  const requestUrlPath = `/Events/Hearings/Detail/${eventId}`
  const { data: pageHtml } = await axios({
    url: requestUrlPath,
    method: "GET"
  })
  const dom = new JSDOM(pageHtml)
  return dom.window.document
}

export const _getEventDetails = (htmlDocument: Document): string => {
  const eventDescriptionElement =
    htmlDocument.querySelector(".eventDescription")
  return eventDescriptionElement?.textContent || ""
}

export const scrapeEventDetails = functions.firestore
  .document("/events/{eventId}")
  .onWrite(async (change, _) => {
    const eventData = change.after.data()
    if (!eventData) return // document was deleted

    const eventDoc = _getDocumentProperties(change.after)
    if (_isUpcomingHearing(eventDoc)) return
    if (_wasScrapedRecently(eventDoc)) return

    const htmlDocument = await _fetchEventPageDom(eventDoc.id)
    const eventDetails = _getEventDetails(htmlDocument)

    eventDoc.ref.update({
      content: {
        ...eventData.content,
        eventDetails,
        eventDetailsScrapeTime: Date.now()
      }
    })
    return
  })
