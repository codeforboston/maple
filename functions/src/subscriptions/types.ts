export interface TopicSubscription {
    topicName: string;
    uid: string;
    billLookup: {
      billId: string;
      court: string;
    };
    type: string;
  }
  