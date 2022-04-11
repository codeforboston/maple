import React from "react"
import * as links from "../links"

const EmailToMyLegislators = ({
  emailToMyLegislatorsURL,
  senator,
  representative
}) => {
  if (senator.member || representative.member) {
    return (
      <>
        <links.External href={emailToMyLegislatorsURL}>
          Email your testimony to your legislators
        </links.External>
      </>
    )
  } else {
    return (
      <links.External href="\profile">
        Add legislators to your profile to email them your testimony
      </links.External>
    )
  }
}

export default EmailToMyLegislators
