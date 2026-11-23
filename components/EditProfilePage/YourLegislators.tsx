import { Col, Row } from "../bootstrap"
import { MemberSearchIndex, ProfileHook } from "../db"
import { useFlags } from "../featureFlags"
import { FIND_MY_LEGISLATOR_URL } from "../legislatorLookup"
import { External } from "../links"
import { SelectLegislators } from "../ProfilePage/SelectLegislators"
import { Trans, useTranslation } from "next-i18next"

export type YourLegislatorsProps = {
  index?: MemberSearchIndex
  profile?: ProfileHook
}

/** The pickers above the note, for Edit Profile's narrow right-hand column. */
export const YourLegislators = ({ index, profile }: YourLegislatorsProps) => {
  const { t } = useTranslation("editProfile")
  const { legislatorAddressLookup } = useFlags()
  return (
    <>
      {/* Stacked in a card with a header band, no extra room above: the
          card's own padding is enough. */}
      <Row className="mb-3 gap-3">
        <Col xs={12} className="your-legislators-width">
          <SelectLegislators index={index} profile={profile} />
        </Col>
        {/* Plain body text under the pickers, with the tool as an ordinary
            link. */}
        <Col xs={12} className="your-legislators-width">
          <p className="mb-0">
            {legislatorAddressLookup ? (
              <Trans
                t={t}
                i18nKey="legislator.lookupHint"
                components={[
                  // eslint-disable-next-line react/jsx-key
                  <External href={FIND_MY_LEGISLATOR_URL} />
                ]}
              />
            ) : (
              <>
                {t("legislator.politeWords")}
                <External href={FIND_MY_LEGISLATOR_URL}>
                  {t("legislator.findTool")}
                </External>
                {t("legislator.findToolTip")}
              </>
            )}
          </p>
        </Col>
      </Row>
    </>
  )
}
