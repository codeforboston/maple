import { Frequency } from "../auth/types"

export type BillDigest = { 
    billId: string,
    billName: string,
    billCourt: number,
    endorse: number,
    neutral: number,
    oppose: number
}
export type Position = "endorse" | "neutral" | "oppose"
export type BillResult = {
    billId: string,
    position: Position
}
export type UserDigest = {
    userId: string,
    userName: string,
    bills: BillResult[]
}
export type NotificationEmailDigest = {
    notificationFrequency: Frequency,
    startDate: Date,
    endDate: Date,
    bills: BillDigest[],
    users: UserDigest[]
}

// 1.) Make type to hold data
// 2.) Two options
// a.) Job that iterates over all notifications from last week, aggregates counts by Bill/User, then uses those counts
//       to generate the digest for each user. This would allow us to prevent re-counting the same bill hundreds of times
//       for each user that follows it.
// b.) Job that iterates over each user, grabs all their notifications, and aggregates into data

/*
    1.) Get all notifications from last week
    2.) Aggregate counts by Bill/User
    3.) Generate digest for each user


    Don't need to scan notifications if we're not going by user - we can scan the notificationEvents directly
    and aggregate counts by Bill/User
*/

// export interface Notification {
//   type: string
//   updateTime: Timestamp
//   billCourt: string
//   billId: string
//   billName: string
// }

// export type BillHistoryUpdateNotification = Notification & {
//   type: "bill"
//   billHistory: BillHistory
// }