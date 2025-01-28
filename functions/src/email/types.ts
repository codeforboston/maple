import { Frequency } from "../auth/types"

export type BillDigest = { 
    billId: string,
    billName: string,
    billCourt: number,
    endorseCount: number,
    neutralCount: number,
    opposeCount: number
    // numNewTestimonies = endorse + neutral + oppose
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
    newTestimonyCount: number, // displayed bills are capped at 6
}
export type NotificationEmailDigest = {
    notificationFrequency: Frequency,
    startDate: Date,
    endDate: Date,
    bills: BillDigest[], // cap of 4
    numBillsWithNewTestimony: number,
    users: UserDigest[], // cap of 4
    numUsersWithNewTestimony: number,
}
