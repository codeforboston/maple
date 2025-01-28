import { Timestamp } from "firebase-admin/firestore";
import { Frequency } from "../auth/types";
import ""

// This doesn't work - if this runs at 8:00AM every Wednesday
/*
    1.) It runs at 8:00AM on Wednesday the 1st, takes some time to process, and saves nextDigestAt
        8:00:02AM on Wednesday the 8th
    2.) On Wednesday the 8th, it runs at 8:00AM, sees that 8:00:02 AM is still in the future, and doesn't send

    To make this work, we need to drop down to day-specificity 
*/
export const getNextDigestAt = (notificationFrequency: Frequency) => {
    const now = Timestamp.fromDate(new Date())
    let nextDigestAt = null
    switch (notificationFrequency) {
        case "Weekly":
            nextDigestAt = Timestamp.fromMillis(
            now.toMillis() + 7 * 24 * 60 * 60 * 1000
            )
            break
        case "Monthly":
            const monthAhead = new Date(now.toDate())
            monthAhead.setMonth(monthAhead.getMonth() + 1)
            nextDigestAt = Timestamp.fromDate(monthAhead)
            break
        case "None":
            nextDigestAt = null
            break
        default:
            console.error(
            `Unknown notification frequency: ${notificationFrequency}`
            )
            break
        }

    return nextDigestAt
}