import { ComponentStory } from "@storybook/react"
import { MessageBanner } from "components/shared/MessageBanner"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Components/Page/MessageBanner",
  figmaUrl:
    "https://www.figma.com/file/DsC9Nzanyb5bXsQfZ3veO9/2023-Base-File?type=design&node-id=3873-31947&mode=dev",
  component: MessageBanner
})

const Template: ComponentStory<typeof MessageBanner> = args => {
  return <MessageBanner {...args} />
}

export const Primary = Template.bind({})

Primary.args = {
  heading: "Organization Request In Progress",
  content:
    "Your request to be updated to an organization is currently in progress, you will be notified my email on if your request has been approved or denied.",
  className: "",
  icon: "/Clock.svg"
}

Primary.storyName = "MessageBanner"
