export interface TopicSubscription {
  topicName: string;
  uid: string;
  type: string;
  billLookup?: {
    billId: string;
    court: string;
  };
  orgLookup?: {
    profileId: string;
    fullName: string;
  }
  nextDigestAt: any;
}
