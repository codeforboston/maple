import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { TabBlock } from "../LegislatorComponents"
import type { District } from "components/db"

const MapPreview = styled.div`
  background: #dfe8fb;
  border: 1px solid #d4deef;
  border-radius: 8px 8px 0 0;
  color: #18358f;
  min-height: 300px;
`

const DistrictCard = styled.section`
  border: 1px #b8c0c9 solid;
  border-radius: 5px;
  overflow: hidden;
`

const Chip = styled.span`
  border: 1px solid #d9dee5;
  border-radius: 999px;
  color: #4a5564;
  display: inline-flex;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  padding: 0.55rem 1rem;
`

function municipalitySummary(district: District) {
  return district.municipalities
    .map(municipality => municipality.name)
    .join(" & ")
}

function subdivisionChips(district: District) {
  const municipalitiesWithSubdivisions = district.municipalities.filter(
    municipality => municipality.subdivisions.length > 0
  )
  const shouldPrefix = municipalitiesWithSubdivisions.length > 1

  return municipalitiesWithSubdivisions.flatMap(municipality =>
    municipality.subdivisions.map(subdivision =>
      shouldPrefix ? `${municipality.name}: ${subdivision}` : subdivision
    )
  )
}

export function DistrictTab({
  district,
  loading
}: {
  district?: District
  loading?: boolean
}) {
  const { t } = useTranslation("legislators")

  if (loading) {
    return <TabBlock>{t("loading")}</TabBlock>
  }

  if (!district) {
    return <TabBlock>{t("districtDetails")}</TabBlock>
  }

  const chips = subdivisionChips(district)

  return (
    <>
      <DistrictCard className="bg-white">
        <MapPreview className="d-flex flex-column align-items-center justify-content-center text-center p-3">
          <FontAwesomeIcon icon={faLocationDot} size="2x" className="mb-4" />
          <h2 className="h4 fw-bold mb-2">{district.district} District</h2>
          <p className="fs-5 mb-0" style={{ color: "#5e74b6" }}>
            Interactive map &middot; Coming soon
          </p>
        </MapPreview>
        <div className="p-4">
          <h1 className="h3 fw-bold mb-2">{district.district} District</h1>
          <p className="fs-5 text-body-secondary mb-3">
            {municipalitySummary(district)}
          </p>
          {chips.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {chips.map(chip => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </div>
          )}
        </div>
      </DistrictCard>
      <p className="text-end text-body-secondary mt-3 mb-0">
        Source: MA Secretary of the Commonwealth district data
      </p>
    </>
  )
}
