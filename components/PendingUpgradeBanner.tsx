import { MessageBanner } from "./shared/MessageBanner"

export const PendingUpgradeBanner = () => (
  <MessageBanner
    icon={"/Clock.svg"}
    heading={"Organization Request In Progress"}
    content="Your request to be upgraded to an organization is currently in progress. You will be notified by email when your request has been reviewed."
  />
)
