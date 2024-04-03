import { Stories } from "@storybook/addon-docs"
import { Meta, StoryObj } from "@storybook/react"

import TabContainer from "react-bootstrap/TabContainer"

import { TabPane } from "react-bootstrap"

import {
  StyledTabContent,
  TabNavItem,
  TabNavWrapper
} from "components/EditProfilePage/StyledEditProfileComponents"

const tabs = [
  {
    title: "Personal Info",
    eventKey: "AboutYou",
    content: <div>Personal Info Tab</div>
  },
  {
    title: "Testimonies",
    eventKey: "Testimonies",
    content: <div>Testimonies Tab</div>
  },
  {
    title: "Following",
    eventKey: "Following",
    content: <div>Following Tab</div>
  }
]

const EditProfileTabs = ({
  key,
  setKey
}: {
  key: string
  setKey: (key: string) => void
}) => {
  return (
    <TabContainer
      defaultActiveKey="AboutYou"
      activeKey={key}
      onSelect={(k: any) => setKey(k)}
    >
      <TabNavWrapper>
        {tabs.map((t, i) => (
          <TabNavItem tab={t} i={i} key={key} />
        ))}
      </TabNavWrapper>
      <StyledTabContent>
        {tabs.map(t => (
          <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
            {t.content}
          </TabPane>
        ))}
      </StyledTabContent>
    </TabContainer>
  )
}

const meta: Meta = {
  title: "Organisms/Edit Profile/StyledTabNav",
  component: EditProfileTabs,
  parameters: {
    docs: {
      page: () => <Stories includePrimary />
    }
  },
  render: args => {
    return (
      <div className="container">
        <EditProfileTabs key={args.key} setKey={args.setKey} />
      </div>
    )
  }
}

export default meta

type Story = StoryObj<typeof EditProfileTabs>

export const Primary: Story = {
  args: {
    key: "AboutYou",
    setKey: (key: string) => console.log(key)
  },
  name: "EditProfileTabs"
}
