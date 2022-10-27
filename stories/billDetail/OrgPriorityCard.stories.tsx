import { Card } from "components/Card"
import { createMeta } from "stories/utils"
import { OrgAvatar } from "stories/components/OrgAvatar"

const OrgPriorityCard = () => {
  return (
    <>
      <Card header={undefined} />
      <OrgAvatar
        name={"Boston Fire Department Union"}
        orgImageSrc="/BFD.png"
        stanceTitle="endorse"
      />
    </>
  )
}

export default createMeta({
  title: "Bill Detail/OrgPriorityCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=242%3A16629",
  component: OrgPriorityCard
})

export const Primary = () => <OrgPriorityCard />
