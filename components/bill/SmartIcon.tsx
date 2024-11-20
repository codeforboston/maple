import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Col, Row } from "../bootstrap"

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
          alt={t("bill.icon.economics-and-public-finance")}
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
    // case "":
    //   return (
    //     <Image
    //       src="/SmartTagIcons/Commerce.svg"
    //       alt={t("bill.icon.commerce")}
    //     />
    //   )
    default:
      return <>*</>
  }
}

// add remaining icons
//
// fill out translations at common.json
