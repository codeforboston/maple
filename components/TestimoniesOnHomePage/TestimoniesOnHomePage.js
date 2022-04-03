import React from "react"
import { useRecentTestimony } from "../db"
import { Button, Container, Row, Spinner, Table } from "react-bootstrap"
import { useRouter } from "next/router"

// the word "testimonies": In more general, commonly used, contexts, the plural form will also be testimony.  However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.

const TestimonyRow = ({ testimony }) => {
  const router = useRouter()
  return (
    <tr>
      <td>{testimony.billId}</td>
      <td>{testimony.position}</td>
      <td>{testimony.content.substring(0, 25)}...</td>
      <td>
        {testimony.authorDisplayName == null ? (
          "(blank)"
        ) : (
          <Button
            variant="primary"
            onClick={() =>
              router.push(`/publicprofile?id=${testimony.authorUid}`)
            }
          >
            {testimony.authorDisplayName}
          </Button>
        )}
      </td>
    </tr>
  )
}

const Testimonies = () => {
  const recentTestimony = useRecentTestimony()

  const testimoniesRows = recentTestimony.map((testimony, index) => {
    return <TestimonyRow key={index} testimony={testimony} />
  })

  return (
    <Container>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Bill</th>
            <th>Position</th>
            <th>Text</th>
            <th>Submitter</th>
          </tr>
        </thead>
        <tbody>{testimoniesRows}</tbody>
      </Table>
    </Container>
  )
}

export default Testimonies
