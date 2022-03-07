import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'
import { useAuth } from "../../components/auth"
import { useProfile, useMember } from "../db"
import * as links from "../../components/links"

const publishTestimony = (props) => {
    console.log("publishing..")
    // save to Firebase
}

const GetMemberEmail = (Id) => {
  const { member } = useMember(Id)
  return member ? member.EmailAddress : null
}

const CommentModal = (props) => {
    const testimonyTemplate = 
`Why I am qualified to provide testimony:

Why this bill is important to me:

My thoughts:
`
    const [testimony, setTestimony] = useState(props.testimony)
    const bill=props.bill
    const showTestimony=props.showTestimony
    const handleCloseTestimony=props.handleCloseTestimony

    const { profile } = useProfile()
    const representativeId = profile ? profile.representative.id : null
    const senatorId = profile ? profile.senator.id : null
    const senatorEmail = GetMemberEmail(senatorId)
    const representativeEmail = GetMemberEmail(representativeId)
 
    // console.log(senatorEmail)
    // console.log(representativeEmail)

    const url = `mailto:${senatorEmail},${representativeEmail}?subject=My testimony on Bill ${bill ? bill.BillNumber : ""}&body=${testimony ? testimony.content : ""}`

    const defaultPositionlowercase = testimony && testimony.position ? testimony.position : "DEFAULT"
    const defaultPosition = defaultPositionlowercase.charAt(0).toUpperCase() + defaultPositionlowercase.slice(1) // need to capitalize test data, tool will ultimately store correctly
    const defaultAnonymous = testimony && testimony.anonymous ? testimony.anonymous : false
    const defaultContent = testimony && testimony.content ? testimony.content : "My comments on this bill.."
    
    return (
     <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
        <Modal.Header closeButton onClick={handleCloseTestimony}>
            <Modal.Title>{"Add Your Testimony" + (bill ? " for " + bill.BillNumber + " - " + bill.Title : "")}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <div className="container">
            <div className="row">
              <div className="col-sm align-middle">
                <select className="form-control" defaultValue={defaultPosition}>
                    <option value="DEFAULT">Select my support..</option>
                    <option value="Endorse">Endorse</option>
                    <option value="Oppose">Oppose</option>
                    <option value="Neutral">Neutral</option>
                </select>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultValue={defaultAnonymous} id="flexCheckChecked"/>
                  <label className="form-check-label" htmlFor="flexCheckChecked">
                      Anonymous
                  </label>
                </div>
                <div>
                  <links.External href={url}>
                      Send copy to your legislators
                  </links.External>
                </div>
                <div>
                  <links.External href={url}>
                      Send copy to relevant committee
                  </links.External>
                </div>
              </div>

              <div className="col-sm">
                <textarea 
                    className="form-control col-sm" 
                    resize="none" 
                    rows="20" 
                    required
                    defaultValue={defaultContent}
                    onChange={e => {
                        const someText = e.target.value
                        const testimonyObject = {content: someText}
                        setTestimony(testimonyObject)
                    }}    
                />
                <Button className="mt-2">Upload a document</Button>
              </div>
            </div>
          </div>       
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={publishTestimony}>
              Publish
          </Button>
        </Modal.Footer>
    </Modal>
    )
} 

export default CommentModal 

