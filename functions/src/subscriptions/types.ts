export interface TopicSubscription {
  topicName: string
  uid: string
  type: string
  billLookup?: {
    billId: string
    court: string
  }

  userLookup?: {
    profileId: string
    fullName: string
  }
}
