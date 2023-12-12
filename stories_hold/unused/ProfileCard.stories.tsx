import { ProfileCard } from "components/ProfileCard"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Dashboard/Side Panels/ProfileCard",
  component: ProfileCard
})

export const Primary = () => (
  <ProfileCard
    joinDate={new Date(2022, 1)}
    name="Peter Parker"
    profileImageSrc="/ProfilePic.png"
  />
)
