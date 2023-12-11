import type { Meta, StoryObj } from "@storybook/react"
import { MessageBanner } from "components/shared/MessageBanner"
import { createMeta } from "stories/utils"

<<<<<<< HEAD:stories/components/page/Banner.stories.tsx
export default createMeta({
  title: "Components/Page/MessageBanner",
  figmaUrl:
    "https://www.figma.com/file/DsC9Nzanyb5bXsQfZ3veO9/2023-Base-File?type=design&node-id=3873-31947&mode=dev",
  component: MessageBanner
})
=======
>>>>>>> a0c13140... begins upgrading stories:stories/molecules/Banner.stories.tsx

const meta: Meta = {
  component: MessageBanner,
}
export default meta
// export default createMeta({
//   title: "Molecules/MessageBanner",
//   figmaUrl:
//     "https://www.figma.com/file/DsC9Nzanyb5bXsQfZ3veO9/2023-Base-File?type=design&node-id=3873-31947&mode=dev",
//   component: MessageBanner
// })

type Story = StoryObj<typeof MessageBanner>


export const Primary: Story = {
  args: {
    heading: "Organization Request In Progress",
    content:
      "Your request to be updated to an organization is currently in progress, you will be notified my email on if your request has been approved or denied.",
    className: "",
    icon: "/Clock.svg"
  },
  name: "MessageBanner"
}