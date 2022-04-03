import { createPage } from "../components/page"
import { usePublishedTestimonyListing } from "../components/db"
import { useRouter } from "next/router"

export default createPage({
  v2: true,
  title: "Testimony",
  Page: () => {
    const router = useRouter()
    const { billId, author } = router.query
    const { result, status } = usePublishedTestimonyListing({
      uid: author as string,
      billId: billId as string
    })
    const testimony =
      status in ["loading", "error"]
        ? undefined
        : result
        ? result[0]
        : undefined

    return (
      <>
        <h1>Testimony</h1>
        <h4>
          {testimony
            ? (testimony.authorDisplayName == null
                ? "Test"
                : testimony.authorDisplayName) +
              " - " +
              testimony.publishedAt.toDate().toLocaleString() +
              " - " +
              testimony.position
            : ""}
        </h4>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {testimony ? testimony.content : ""}
        </p>
        {/* <h4>
            {testimony && testimony.attachment != null ? (
              <Button variant="primary">See attachment</Button>
            ) : (
              ""
            )}
          </h4> */}
      </>
    )
  }
})
