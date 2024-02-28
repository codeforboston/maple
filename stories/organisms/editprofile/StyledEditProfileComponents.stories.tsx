import { Stories } from "@storybook/addon-docs"
import { Meta, StoryObj } from "@storybook/react"
import * as SC from "components/EditProfilePage/StyledEditProfileComponents"
import { FC, ReactNode } from "react"

const EditProfileComponents: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <SC.Header>Header</SC.Header>
      <SC.OrgIconSmall />
      <SC.StyledTabNav>TabNav</SC.StyledTabNav>
      <SC.StyledTabContent>{children}</SC.StyledTabContent>
      <SC.StyledHr />
      <SC.StyledSaveButton>Save Button</SC.StyledSaveButton>
      <SC.VerifiedBadge />
    </>
  )
}
const meta: Meta = {
  title: "Organisms/Edit Profile/StyledTabNav",
  component: EditProfileComponents,
  parameters: {
    docs: {
      page: () => <Stories includePrimary />
    }
  }
}

export default meta

type Story = StoryObj<typeof EditProfileComponents>

export const Primary: Story = {
  args: {
    children: "TabContent"
  },
  name: "StyledTabNav"
}
