import { ResourcesCard } from "components/dashboard"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Dashboard/Side Panels/ResourcesCard",
  component: ResourcesCard
})

export const Primary = () => <ResourcesCard />
