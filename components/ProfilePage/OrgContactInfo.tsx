import { Row, Col, Image } from "react-bootstrap"
import { External } from "components/links"
import { Profile } from "../db"
import { ContactInfoRow } from "./StyledProfileComponents"


export const OrgContactInfo = ({
    profile
  }: {
    profile?: Profile
  }) => {

    const { email, phone, website }: { email?: string; phone?: string; website?:string} =
      profile?.orgContactInfo ?? {}
    
    const location = profile?.location ?? null

    return(

      <div>
        
        {email && (
          <ContactInfoRow>
            <div className="d-flex justify-content-end">
              {email}
            </div>

          </ContactInfoRow>
        )}

        {phone && (
          <ContactInfoRow>
            <div className="d-flex justify-content-end">
              {phone}

            </div>
    

          </ContactInfoRow>
        )}  

        {website && (
          <ContactInfoRow>
            <External className="d-flex justify-content-end" plain href={website}>
                {website}
            </External>

          </ContactInfoRow>
        )}

        {location && (
          <ContactInfoRow>
            <div className="d-flex justify-content-end fw-bold">
              {location}

            </div>
    

          </ContactInfoRow>
        )} 

 
   

      </div>


    )
  }
