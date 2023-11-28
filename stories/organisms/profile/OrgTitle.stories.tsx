import { createMeta } from "stories/utils"

// TODO: move into components directory
const OrgTitle = () => <div>TODO</div>

export default createMeta({
  title: "Profile/OrgTitle",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=229%3A8111",
  component: OrgTitle
})

export const Primary = () => <OrgTitle />
