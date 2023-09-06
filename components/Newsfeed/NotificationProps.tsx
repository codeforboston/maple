export type NotificationProps = {
  bodyText: string
  court: string
  header: string
  id: string
  subheader: string
  type: string
  topicName: string
  timestamp: Timestamp
  createdAt: Timestamp
}

export type Notifications = NotificationProps[]
