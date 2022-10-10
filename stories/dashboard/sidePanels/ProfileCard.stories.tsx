import ProfileContainer from "components/profileCard/profileComponents"
import { createMeta } from "stories/utils"

// TODO: move into components directory
const ProfileCard = () => (
  <div>
    <ProfileContainer />
  </div>
)

export default createMeta({
  title: "Dashboard/Side Panels/ProfileCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=296%3A15838",
  component: ProfileCard
})

export const Primary = () => <ProfileCard />
