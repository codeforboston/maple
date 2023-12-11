import { Meta, StoryObj } from "@storybook/react"
import { SocialIconLink } from "../../components/SocialIconLink/SocialIconLink"


const meta: Meta = {
  title: "Components/SocialIconLink",
  component: SocialIconLink
}

export default meta 

type Story = StoryObj<typeof SocialIconLink>

export const Primary : Story = {
  render: args => <SocialIconLink
  href="https://www.instagram.com"
  svgSrc="/images/instagram.svg"
  alt="instagram"
  />
}

