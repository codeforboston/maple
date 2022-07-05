import { Alert, Row, Spinner } from "../bootstrap"
import { useBill } from "../db"
import { Layout } from "./Layout"

export const BillDetails = ({ billId }: { billId: string }) => {
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
    return <Layout bill={bill} />
  }
  return null
}
