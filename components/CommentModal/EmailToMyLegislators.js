import React from "react"
import { Button, Modal, Checkbox, Form } from "react-bootstrap"
import * as links from "../../components/links"

const EmailToMyLegislators = ({
  checkedSendToYourLegislators,
  setCheckedSendToYourLegislators,
  senator,
  representative
}) => {
  const handleChangeSendToYourLegislators = () => {
    setCheckedSendToYourLegislators(!checkedSendToYourLegislators)
  }

  if (senator.member || representative.member) {
    return (
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={checkedSendToYourLegislators}
          id="flexCheckChecked"
          onChange={handleChangeSendToYourLegislators}
        />
        <label className="form-check-label">
          Send copy to your legislators
        </label>
      </div>
    )
  } else {
    return (
      <links.External href="\profile">
        Add legislators to your profile to share your testimony
      </links.External>
    )
  }
}

export default EmailToMyLegislators
