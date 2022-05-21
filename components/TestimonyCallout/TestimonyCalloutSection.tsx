import { Row } from "react-bootstrap"
import { useRecentTestimony } from "../db"
import TestimonyCallout from "./TestimonyCallout"

export default function TestimonyCalloutSection() {
  const recentTestimony = useRecentTestimony()

  return (
    <Row xs={1} md={2}>
      {recentTestimony?.map(t => (
        <TestimonyCallout key={t.authorUid + t.billId} {...t} />
      ))}
    </Row>
  )
}
