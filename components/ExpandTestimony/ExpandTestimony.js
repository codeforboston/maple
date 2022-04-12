import copy from "copy-to-clipboard"
import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"
import { getDirectTestimonyLink, Wrap } from "../links"
import { ViewAttachment } from "../ViewAttachment"
import { FormattedBillTitle, FormattedTestimonyTitle } from "../formatting"
import { TableButton } from "../buttons"

const ExpandTestimony = props => {
  const { bill, testimony } = props

  const [showTestimony, setShowTestimony] = useState(false)

  const openTestimony = () => {
    setShowTestimony(true)
  }
  const closeTestimony = () => {
    setShowTestimony(false)
  }
  return (
    <>
      <TableButton onclick={openTestimony}>
        Expand
      </TableButton>
      <Modal show={showTestimony} onHide={closeTestimony} size="lg">
        <Modal.Header closeButton onClick={closeTestimony}>
          <Modal.Title>
            <div className="d-flex justify-content-center">
              <div>Testimony on</div>
            </div>
            {bill
              ? <FormattedBillTitle bill={bill} />
              : "No bill associated with this testimony"
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {testimony
            ? <FormattedTestimonyTitle testimony={testimony} />
            : ""}
          <p style={{ whiteSpace: "pre-wrap" }}>
            {testimony ? testimony.content : ""}
          </p>
          <p>
            <ViewAttachment testimony={testimony} />
          </p>
          <Wrap href={getDirectTestimonyLink(testimony)}>
            <Button variant="primary">See full page</Button>
          </Wrap>
          <Button
            variant="primary"
            className="ms-2"
            onClick={() => {
              copy(getDirectTestimonyLink(testimony))
            }}
          >
            Copy Link
          </Button>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ExpandTestimony
