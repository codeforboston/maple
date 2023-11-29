import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { Stories } from "@storybook/addon-docs"
import * as SC from "components/EditProfilePage/StyledEditProfileComponents"
import { ReactNode, FC } from "react"

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

export default createMeta({
  title: "Organisms/Profile/StyledTabNav",
  component: EditProfileComponents,
  parameters: {
    docs: {
      page: () => <Stories includePrimary />
    }
  }
})

const Template: ComponentStory<typeof EditProfileComponents> = args => (
  <EditProfileComponents {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  children: "TabContent"
}
