import { External } from "components/links"
import { ContactInfoRow } from "./StyledProfileComponents"
import { SocialMediaIcons } from "./SocialMediaIcons"
import { Profile } from "common/profile/types"

export const OrgContactInfo = ({ profile }: { profile?: Profile }) => {
  const {
    publicEmail,
    publicPhone,
    website
  }: { publicEmail?: string; publicPhone?: number; website?: string } =
    profile?.contactInfo ?? {}

  const {
    twitter,
    linkedIn,
    instagram,
    fb
  }: { twitter?: string; linkedIn?: string; instagram?: string; fb?: string } =
    profile?.social ?? {}

  const location = profile?.location ?? null

  return (
    <div className={`ms-4 mb-4`}>
      {publicEmail && (
        <ContactInfoRow>
          <div className="d-flex justify-content-start">{publicEmail}</div>
        </ContactInfoRow>
      )}

      {publicPhone && (
        <ContactInfoRow>
          <div className="d-flex justify-content-start">{publicPhone}</div>
        </ContactInfoRow>
      )}

      {website && (
        <ContactInfoRow>
          <External
            className="d-flex justify-content-start"
            plain
            href={`https://${website}`}
          >
            {website}
          </External>
        </ContactInfoRow>
      )}

      {location && (
        <ContactInfoRow>
          <div className="d-flex justify-content-start fw-bold">{location}</div>
        </ContactInfoRow>
      )}

      <ContactInfoRow>
        <div className="d-flex justify-content-start">
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
