import { createMeta } from "../utils"
import { SocialIconLink } from "components/SocialIconLink/SocialIconLink"

export default createMeta({
  title: "Atoms/SocialIconLink",
  figmaUrl:
    "https://www.figma.com/file/Uyh2NXGTCX60mkse2NVBH7/MAPLE?node-id=1866%3A22187&t=3xgP9SclEre3LNeo-4",
  component: SocialIconLink
})

export const Primary = () => (
  <SocialIconLink
    href="https://www.instagram.com"
    svgSrc="/images/instagram.svg"
    alt="instagram"
  />
)
