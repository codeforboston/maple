import { Timestamp } from "firebase-admin/firestore";
import { Frequency } from "../auth/types";
import { startOfDay } from "date-fns";

// TODO - Unit test this function
export const getNextDigestAt = (notificationFrequency: Frequency) => {
    const now = startOfDay(new Date())
    let nextDigestAt = null
    switch (notificationFrequency) {
        case "Weekly":
            const weekAhead = new Date(now)
            weekAhead.setDate(weekAhead.getDate() + 7)
            nextDigestAt = Timestamp.fromDate(weekAhead)
            break
        case "Monthly":
            const monthAhead = new Date(now)
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