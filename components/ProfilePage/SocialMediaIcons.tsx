import { Row, Col, Image } from "react-bootstrap"
import { External } from "components/links"

export const SocialMediaIcons = ({
    twitter,
    linkedIn, 
    instagram, 
    fb
  }: {
    twitter?: string
    instagram?:string
    fb?:string
    linkedIn?: string
  }) => (
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
            <Col>
                {instagram && (
                <External plain href={`https://www.instagram.com/${instagram}`}>
                    <Image alt="instagram" src="/linkedin.svg" />
                </External>
                )}
            </Col>
            <Col>
                {fb && (
                <External plain href={`https://www.facebook.com/${linkedIn}`}>
                    <Image alt="facebook" src="/twitter.svg" />
                </External>
                )}
            </Col>
        </Row>

    </div>
    
  )
  