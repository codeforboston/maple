import { Row, Col, Image } from "react-bootstrap"
import { External } from "components/links"
import { Profile } from "../db"
import { ContactInfoRow } from "./StyledProfileComponents"
import { SocialMediaIcons } from "./SocialMediaIcons"

export const OrgContactInfo = ({ profile }: { profile?: Profile }) => {
  const {
    publicEmail,
    publicPhone,
    website
  }: { publicEmail?: string; publicPhone?: number; website?: string } =
    profile?.orgContactInfo ?? {}

  const {
    twitter,
    linkedIn,
    instagram,
    fb
  }: { twitter?: string; linkedIn?: string; instagram?: string; fb?: string } =
    profile?.social ?? {}

  const location = profile?.location ?? null

  return (
    <div>
      {publicEmail && (
        <ContactInfoRow>
          <div className="d-flex justify-content-end">{publicEmail}</div>
        </ContactInfoRow>
      )}

      {publicPhone && (
        <ContactInfoRow>
          <div className="d-flex justify-content-end">{publicPhone}</div>
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
          <div className="d-flex justify-content-end fw-bold">{location}</div>
        </ContactInfoRow>
      )}

      <ContactInfoRow>
        <div className="d-flex justify-content-end">
          <SocialMediaIcons
            twitter={twitter}
            linkedIn={linkedIn}
            instagram={instagram}
            fb={fb}
          />
        </div>
      </ContactInfoRow>
    </div>
  )
}
