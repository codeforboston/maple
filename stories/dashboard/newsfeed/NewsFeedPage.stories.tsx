import { NewsFeedCard } from "components/NewsFeedPages/NewsFeedCard"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Dashboard/newsfeed/NewsFeedPage",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=158%3A3865",
  component: NewsFeedCard
})

export const Primary = () => <NewsFeedCard />
