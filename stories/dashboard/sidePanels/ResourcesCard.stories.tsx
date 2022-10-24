import { createMeta } from "stories/utils"
import ResourcesCards from "../../../components/ResourcesCards/ResourcesCard"
// TODO: move into components directory
const ResourcesCard = () => <ResourcesCards />

export default createMeta({
  title: "Dashboard/Side Panels/ResourcesCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=123%3A3003",
  component: ResourcesCard
})

export const Primary = () => <ResourcesCard />
