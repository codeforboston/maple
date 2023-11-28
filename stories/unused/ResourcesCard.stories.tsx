import { ResourcesCard } from "components/dashboard"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Dashboard/Side Panels/ResourcesCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=123%3A3003",
  component: ResourcesCard
})

export const Primary = () => <ResourcesCard />
