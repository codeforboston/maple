import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import styled from "styled-components"

const Spacer = styled.div`
  position: relative;
  top: 0.5px;
`

export const SmartIcon = ({ icon }: { icon: String }) => {
  const { t } = useTranslation("common")

  switch (icon) {
    case "Commerce":
      return (
        <Image
          src="/SmartTagIcons/Commerce.svg"
          alt={t("bill.icon.commerce")}
        />
      )
    case "Crime and Law Enforcement":
      return (
        <Image
          src="/SmartTagIcons/Crime-and-Law-Enforcement.svg"
          alt={t("bill.icon.crime_and_law_enforcement")}
        />
      )
    case "Economics and Public Finance":
      return (
        <Image
          src="/SmartTagIcons/Economics-and-Public-Finance.svg"
          alt={t("bill.icon.economics_and_public_finance")}
        />
      )
    case "Education":
      return (
        <Image
          src="/SmartTagIcons/Education.svg"
          alt={t("bill.icon.education")}
        />
      )
    case "Emergency Management":
      return (
        <Image
          src="/SmartTagIcons/Emergency-Management.svg"
          alt={t("bill.icon.emergency_management")}
        />
      )
    case "Energy":
      return (
        <Image src="/SmartTagIcons/Energy.svg" alt={t("bill.icon.energy")} />
      )
    case "Environmental Protection":
      return (
        <Image
          src="/SmartTagIcons/Environmental-Protection.svg"
          alt={t("bill.icon.environmental_protection")}
        />
      )
    case "Families":
      return (
        <Image
          src="/SmartTagIcons/Families.svg"
          alt={t("bill.icon.families")}
        />
      )
    case "Food, Drugs and Alcohol":
      return (
        <Spacer>
          <Image
            src="/SmartTagIcons/Food-Drugs-and-Alcohol.svg"
            alt={t("bill.icon.food_drugs_and_alcohol")}
          />
        </Spacer>
      )
    case "Government Operations and Elections":
      return (
        <Image
          src="/SmartTagIcons/Government-Operations-and-Elections.svg"
          alt={t("bill.icon.government_operations_and_elections")}
        />
      )
    case "Healthcare":
      return (
        <Spacer>
          <Image
            src="/SmartTagIcons/Healthcare.svg"
            alt={t("bill.icon.healthcare")}
          />
        </Spacer>
      )
    case "Housing and Community Development":
      return (
        <Image
          src="/SmartTagIcons/Housing-and-Community-Development.svg"
          alt={t("bill.icon.housing_and_community_development")}
        />
      )
    case "Immigrants and Foreign Nationals":
      return (
        <Image
          src="/SmartTagIcons/Immigrants-and-Foreign-Nationals.svg"
          alt={t("bill.icon.immigrants_and_foreign_nationals")}
        />
      )
    case "Labor and Employment":
      return (
        <Image
          src="/SmartTagIcons/Labor-and-Employment.svg"
          alt={t("bill.icon.labor_and_employment")}
        />
      )
    case "Law and Judiciary":
      return (
        <Image
          src="/SmartTagIcons/Law-and-Judiciary.svg"
          alt={t("bill.icon.law_and_judiciary")}
        />
      )
    case "Public and Natural Resources":
      return (
        <Image
          src="/SmartTagIcons/Public-and-Natural-Resources.svg"
          alt={t("bill.icon.public_and_natural_resources")}
        />
      )
    case "Social Services":
      return (
        <Image
          src="/SmartTagIcons/Social-Services.svg"
          alt={t("bill.icon.social_services")}
        />
      )
    case "Sports and Recreation":
      return (
        <Image
          src="/SmartTagIcons/Sports-and-Recreation.svg"
          alt={t("bill.icon.sports_and_recreation")}
        />
      )
    case "Taxation":
      return (
        <Image
          src="/SmartTagIcons/Taxation.svg"
          alt={t("bill.icon.taxation")}
        />
      )
    case "Technology and Communications":
      return (
        <Image
          src="/SmartTagIcons/Technology-and-Communications.svg"
          alt={t("bill.icon.technology_and_communications")}
        />
      )
    case "Transportation and Public Works":
      return (
        <Image
          src="/SmartTagIcons/Transportation-and-Public-Works.svg"
          alt={t("bill.icon.transportation_and_Public_Works")}
        />
      )
    default:
      return <>*</>
  }
}
