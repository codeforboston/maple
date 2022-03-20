import React from "react"
import { requireAuth } from "../components/auth"
import * as links from "../components/links"
import { createPage } from "../components/page"
import SelectLegislators from "../components/SelectLegislators"
import MyTestimonies from "../components/MyTestimonies/MyTestimonies"

export default createPage({
  v2: true,
  title: "Profile",
  // need a hook to get user info?
  Page: requireAuth(({ user: { displayName } }) => {
    return (
      <>
        <SelectLegislators />
        About me:
        <textarea className="form-control col-sm" rows={5} required />
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckChecked"
            // checked={checkedSendToCommittee}
            // checked={true}
            // onChange={handleChangeSendToCommittee}
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
            Allow others to see my profile
          </label>
        </div>
        <div className="mt-2">
          <MyTestimonies />
        </div>
      </>
    )
  })
})

const decodeHtmlCharCodes = (s: string) =>
  s.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
    String.fromCharCode(charCode)
  )
