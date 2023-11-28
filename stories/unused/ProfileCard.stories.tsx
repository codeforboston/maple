import { ProfileCard } from "components/ProfileCard"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Unused/ProfileCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=296%3A15838",
  component: ProfileCard
})

export const Primary = () => (
  <ProfileCard
    joinDate={new Date(2022, 1)}
    name="Peter Parker"
    profileImageSrc="/ProfilePic.png"
  />
)
