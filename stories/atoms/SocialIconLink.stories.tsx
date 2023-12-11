import { Meta } from "@storybook/react"
import { SocialIconLink } from "components/SocialIconLink/SocialIconLink"

const meta: Meta = {
  title: "Atoms/SocialIconLink",
  component: SocialIconLink
}


export const Primary = () => (
  <SocialIconLink
    href="https://www.instagram.com"
    svgSrc="/images/instagram.svg"
    alt="instagram"
  />
)

export default meta