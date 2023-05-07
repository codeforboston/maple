export interface TopicSubscription {
  topicName: string;
  uid: string;
  type: string;
  billLookup?: {
    billId: string;
    court: string;
  };
  orgId?: string;
}
