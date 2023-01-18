import { Alert, Row, Spinner } from "../bootstrap"
import { useBill } from "../db"

export default function BillFollowingTitle({ billId }: { billId: string }) {
  const { loading, error, result: bill } = useBill(billId)

  if (loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  } else if (error) {
    return (
      <Alert variant="danger">An error occured. Please refresh the page.</Alert>
    )
  } else if (bill) {
    return <h6>{bill?.content.Title}</h6>
  }
  return null
}
