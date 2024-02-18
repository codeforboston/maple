import { Stories } from "@storybook/addon-docs"
import { Meta, StoryObj } from "@storybook/react"
import * as SC from "components/EditProfilePage/StyledEditProfileComponents"
import { FC, ReactNode } from "react"

const EditProfileComponents: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <SC.Header>Header</SC.Header>
      <SC.OrgIconSmall />
      <div>styled tab nav</div>
      <SC.StyledTabNav>TabNav</SC.StyledTabNav>
      <div>end tabnav</div>
      <div>styled tab content</div>
      <SC.StyledTabContent>{children}</SC.StyledTabContent>
      <div>end tab content</div>
      <SC.StyledHr />
      {/* <SC.StyledSaveButton>Save Button</SC.StyledSaveButton> */}
      <div className={`col-2`}>

        <SC.VerifiedBadge><div className={"verifiedText"}>verified badge</div></SC.VerifiedBadge>
      </div>
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
