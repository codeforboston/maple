import { LoadingPage } from "components/LoadingPage"
import {
  TestimonyDetailPage,
  useFetchPageData
} from "components/testimony/TestimonyDetailPage"
import { createPage } from "../components/page"

export default createPage({
  title: "Testimony",
  Page: () => {
    return (
      <LoadingPage result={useFetchPageData()} Page={TestimonyDetailPage} />
    )
  }
})
