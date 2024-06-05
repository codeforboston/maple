import { ComponentStory } from "@storybook/react"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Timestamp } from "firebase/firestore"
import React from "react"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

// TODO: move into components directory

type TestimonyItemProps = React.ComponentProps<typeof TestimonyItem>

const TestimonyItemFC: React.FC<TestimonyItemProps> = (
  props: TestimonyItemProps
) => <TestimonyItem {...props} />

export default createMeta({
  title: "Organisms/Profile/UserTestimonyListCard",
  component: TestimonyItemFC,
  decorators: [
    (Story, ...rest) => {
      const { store, props } = wrapper.useWrappedStore(...rest)

      return (
        <Redux store={store}>
          <Providers>
            <Story />
          </Providers>
        </Redux>
      )
    }
  ]
})

const Template: ComponentStory<typeof TestimonyItemFC> = args => {
  return <TestimonyItemFC {...args} />
}

const Primary = Template.bind({})

Primary.decorators = [
  (Story, ...rest) => {
    const { store, props } = wrapper.useWrappedStore(...rest)

    return (
      <Redux store={store}>
        <Providers>
          <Story />
        </Providers>
      </Redux>
    )
  }
]

Primary.args = {
  testimony: {
    id: "1",
    billId: "123",
    court: 1,
    position: "endorse" as const,
    content: "Content",
    authorUid: "user123",
    authorDisplayName: "John Doe",
    authorRole: "user",
    billTitle: "Bill Title",
    version: 1.0,
    publishedAt: Timestamp.fromDate(new Date("2022-01-01T00:00:00.000Z")),
    draftAttachmentId: "attachment123",
    fullName: ""
  },
  isUser: true,
  onProfilePage: true
}
