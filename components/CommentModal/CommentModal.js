import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'
import { useAuth } from "../../components/auth"
import { useProfile, useMember, useTestimony } from "../db"
import { useEditTestimony } from "../db/testimony/useEditTestimony"
import * as links from "../../components/links"

const GetMemberEmail = (Id) => {
  const { member } = useMember(Id)
  return member ? member.EmailAddress : null
}

const CommentModal = (props) => {
  const useTestimonyTemplate = false
  const testimonyTemplate = 
`Why I am qualified to provide testimony:

Why this bill is important to me:
  
My thoughts:
  `
  const defaultTestimony = useTestimonyTemplate ? testimonyTemplate : "My comments on this bill..."
  const [testimony, setTestimony] = useState(props.testimony ? props.testimony : {content: defaultTestimony})
  
    const bill=props.bill
    const showTestimony=props.showTestimony
    const handleCloseTestimony=props.handleCloseTestimony

    const { user, authenticated } = useAuth()
    const { profile } = useProfile()
    const representativeId = profile && profile.representative ? profile.representative.id : null
    const senatorId = profile && profile.senator ? profile.senator.id : null
    const senatorEmail = senatorId ? GetMemberEmail(senatorId) : ""
    const representativeEmail = representativeId ? GetMemberEmail(representativeId) : ""
    const edit = useEditTestimony(user.uid, bill.BillNumber)
    

    const url = `mailto:${senatorEmail},${representativeEmail}?subject=My testimony on Bill ${bill ? bill.BillNumber : ""}&body=${testimony ? testimony.content : ""}`

    const defaultPosition = testimony && testimony.position ? testimony.position : undefined
  
    const defaultAnonymous = testimony && testimony.anonymous ? testimony.anonymous : false
    const defaultContent = testimony && testimony.content ? testimony.content : defaultTestimony
    
    const publishTestimony = async () => {
      await edit.saveDraft.execute(testimony)
      await edit.publishTestimony.execute()
    }
    
    return (
     <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
        <Modal.Header closeButton onClick={handleCloseTestimony}>
            <Modal.Title>{"Add Your Testimony" + (bill ? " for " + bill.BillNumber + " - " + bill.Title : "")}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <div className="container">
            <div className="row">
              <div className="col-sm align-middle">
                <select className="form-control" defaultValue={defaultPosition} 
                    onChange={e => {
                        const newPosition = e.target.value
                        if (newPosition) {
                          const testimonyObject = {content: testimony.content, position: newPosition}
                          setTestimony(testimonyObject)
                        }
                    }}>
                    <option>Select my support..</option>
                    <option value="endorse">Endorse</option>
                    <option value="oppose">Oppose</option>
                    <option value="neutral">Neutral</option>
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
                        const newText = e.target.value
                        const testimonyObject = {position: testimony.position, content: newText}
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
