import { skipToken } from "@reduxjs/toolkit/dist/query"
import { LoadingPage } from "components/LoadingPage"
import {
  TestimonyDetailPage,
  useTestimonyDetailPageDataQuery
} from "components/testimony/TestimonyDetailPage"
import { params } from "components/utils"
import { useRouter } from "next/router"
import { createPage } from "../components/page"

export default createPage({
  title: "Testimony",
  Page: () => {
    const router = useRouter()
    const billId = params.string(router, "billId"),
      author = params.string(router, "author"),
      court = params.number(router, "court") ?? 192

    const { data } = useTestimonyDetailPageDataQuery(
      author && court && billId
        ? { authorUid: author, billId, court }
        : skipToken
    )

    return data ? <TestimonyDetailPage {...data} /> : <LoadingPage />
  }
})
