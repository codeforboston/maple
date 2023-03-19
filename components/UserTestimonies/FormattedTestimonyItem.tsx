import { TestimonyContent } from "components/testimony"
import React, { useState } from "react"
import { Button, Col } from "../bootstrap"



export const FormattedTestimonyContent = ({
    testimony
  }: {
    testimony: string
  }) => {
    const snippetChars = 500
    const [showAllTestimony, setShowAllTestimony] = useState(false)
    const snippet = showAllTestimony
      ? testimony
      : testimony.slice(0, snippetChars)
    const canExpand = snippet.length !== testimony.length
  
    return (
      <>
        <TestimonyContent className="col m2" testimony={snippet} />
  
        {canExpand && (
          <Col className="ms-auto d-flex justify-content-start justify-content-sm-end">
            <Button variant="link" onClick={() => setShowAllTestimony(true)}>
              Show More
            </Button>
          </Col>
        )}
      </>
    )
  }