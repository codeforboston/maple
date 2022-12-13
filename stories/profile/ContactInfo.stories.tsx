import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { ContactInfo } from "../../components/ContactInfo/ContactInfo"
import { SocialIconLink } from "../../components/SocialIconLink/SocialIconLink"

export default createMeta({
  title: "Profile/ContactInfo",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=229%3A8117",
  component: ContactInfo
})

const Template: ComponentStory<typeof ContactInfo> = args => (
  <div style={{ width: "400px" }}>
    <ContactInfo {...args} />
  </div>
)

export const Primary = Template.bind({})

Primary.args = {
  phoneNumber: "555-555-5555",
  email: "info@concernedparents.com",
  website: "concernedparentsofmass.com",
  icons: (
    <>
      <SocialIconLink
        href="www.instagram.com"
        svgSrc="/images/instagram.svg"
        alt="instagram"
      />
      <SocialIconLink
        href="www.twitter.com"
        svgSrc="/images/twitter.svg"
        alt="twitter"
      />
      <SocialIconLink
        href="www.facebook.com"
        svgSrc="/images/facebook.svg"
        alt="facebook"
      />
    </>
  )
}
