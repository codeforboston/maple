import React from "react"
import { usePublishedTestimonyListing } from "../db"
import { Table, Container, Button } from "react-bootstrap"
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
      <td>{testimony.publishedAt.toDate().toLocaleString()}</td>
    </tr>
  )
}

const TestimoniesOnHomePageTable = ({ testimonies }) => {
  const testimoniesComponent = testimonies.map((testimony, index) => {
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
            <th>Date Submitted</th>
          </tr>
        </thead>
        <tbody>{testimoniesComponent}</tbody>
      </Table>
    </Container>
  )
}

const Testimonies = () => {
  // need these to be sorted by date - most recent first
  const testimoniesResponse = usePublishedTestimonyListing({})
  const testimonies =
    testimoniesResponse.status == "success" ? testimoniesResponse.result : []

  return (
    <div>
      <TestimoniesOnHomePageTable testimonies={testimonies} />
    </div>
  )
}

export default Testimonies
