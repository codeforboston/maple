import { Row, Col, Image } from "react-bootstrap"
import { External } from "components/links"
import { Profile } from "../db"

export const OrgContactInfo = ({
    profile
  }: {
    profile?: Profile
  }) => {

    const { twitter, linkedIn, instagram, fb }: { twitter?: string; linkedIn?: string; instagram?:string; fb?: string } =
      profile?.social ?? {}

    return(
        <div>
        <Row xs="auto">
            <Col>
                {twitter && (
                <External plain href={`https://www.twitter.com/${twitter}`}>
                    <Image alt="twitter" src="/twitter.svg" />
                </External>
                )}
            </Col>
            <Col>
                {linkedIn && (
                <External plain href={`https://www.linkedin.com/in/${linkedIn}`}>
                    <Image alt="linkedIn" src="/linkedin.svg" />
                </External>
                )}
            </Col>
        </Row>

    </div>

    )
  }
