import { useRouter } from "next/router"
import Bill from "../components/Bill/Bill"
import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"

export default createPage({
  title: "Bill",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return billId ? (
      <Container className="mt-3">
        <Bill billId={billId} />
      </Container>
    ) : null
  }
})
