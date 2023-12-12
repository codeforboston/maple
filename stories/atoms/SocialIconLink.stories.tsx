import { Meta, StoryObj } from "@storybook/react"
import { SocialIconLink } from "components/SocialIconLink/SocialIconLink"

const meta: Meta = {
  title: "Atoms/SocialIconLink",
  component: SocialIconLink
}

type Story = StoryObj<typeof SocialIconLink>

export const Primary: Story = {
  render: () => (
    <SocialIconLink
      href="https://www.instagram.com"
      svgSrc="/images/instagram.svg"
      alt="instagram"
    />
  ),
  name: "SocialIconLink"
}

export default meta
