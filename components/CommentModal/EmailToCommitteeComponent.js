import React from "react"
import * as links from "../links"

const EmailToCommittee = ({ emailToCommitteeChairsURL }) => {
  if (emailToCommitteeChairsURL) {
    return (
      <>
        <links.External href={emailToCommitteeChairsURL}>
          Email your testimony to the relevant committee
        </links.External>
      </>
    )
  } else return <></>
}

export default EmailToCommittee
