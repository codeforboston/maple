import { createMeta } from "stories/utils"
import { BillStatusCard } from "components/BillStatusCard/BillStatusCard"

export default createMeta({
  title: "Dashboard/Mission Center/BillStatusCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=231%3A13623",
  component: BillStatusCard
})

export const Primary = () => <BillStatusCard />
