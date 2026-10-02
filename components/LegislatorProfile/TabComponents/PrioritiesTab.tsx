import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { Form } from "../../bootstrap"
import { ProfileHook, useProfile } from "../../db"
import Input from "../../forms/Input"
import { SubmitButton, TabBlock } from "../LegislatorComponents"

import { useAuth } from "components/auth"

import CommerceIcon from "public/SmartTagIcons/blue-variants/Commerce"
import CrimeAndLawEnforcementIcon from "public/SmartTagIcons/blue-variants/Crime-and-Law-Enforcement"
import EconomicsAndPublicFinanceIcon from "public/SmartTagIcons/blue-variants/Economics-and-Public-Finance"
import EducationIcon from "public/SmartTagIcons/blue-variants/Education"
import EmergencyManagementIcon from "public/SmartTagIcons/blue-variants/Emergency-Management"
import EnergyIcon from "public/SmartTagIcons/blue-variants/Energy"
import EnvironmentalProtectionIcon from "public/SmartTagIcons/blue-variants/Environmental-Protection"
import FamiliesIcon from "public/SmartTagIcons/blue-variants/Families"
import FoodDrugsAndAlcoholIcon from "public/SmartTagIcons/blue-variants/Food-Drugs-and-Alcohol"
import GovernmentOperationsAndElectionsIcon from "public/SmartTagIcons/blue-variants/Government-Operations-and-Elections"
import HealthcareIcon from "public/SmartTagIcons/blue-variants/Healthcare"
import HousingAndCommunityDevelopmentIcon from "public/SmartTagIcons/blue-variants/Housing-and-Community-Development"
import ImmigrantsAndForeignNationalsIcon from "public/SmartTagIcons/blue-variants/Immigrants-and-Foreign-Nationals"
import LaborAndEmploymentIcon from "public/SmartTagIcons/blue-variants/Labor-and-Employment"
import LawAndJudiciaryIcon from "public/SmartTagIcons/blue-variants/Law-and-Judiciary"
import PublicAndNaturalResourcesIcon from "public/SmartTagIcons/blue-variants/Public-and-Natural-Resources"
import SocialServicesIcon from "public/SmartTagIcons/blue-variants/Social-Services"
import SportsAndRecreationIcon from "public/SmartTagIcons/blue-variants/Sports-and-Recreation"
import TaxationIcon from "public/SmartTagIcons/blue-variants/Taxation"
import TechnologyAndCommunicationsIcon from "public/SmartTagIcons/blue-variants/Technology-and-Communications"
import TransportationAndPublicWorksIcon from "public/SmartTagIcons/blue-variants/Transportation-and-Public-Works"

const SVG_MAP = {
  commerce: <CommerceIcon width="24" height="24" />,
  crime: <CrimeAndLawEnforcementIcon width="24" height="24" />,
  economics: <EconomicsAndPublicFinanceIcon width="24" height="24" />,
  education: <EducationIcon width="24" height="24" />,
  emergency: <EmergencyManagementIcon width="24" height="24" />,
  energy: <EnergyIcon width="24" height="24" />,
  environment: <EnvironmentalProtectionIcon width="24" height="24" />,
  families: <FamiliesIcon width="24" height="24" />,
  fda: <FoodDrugsAndAlcoholIcon width="24" height="24" />,
  government: <GovernmentOperationsAndElectionsIcon width="24" height="24" />,
  healthcare: <HealthcareIcon width="24" height="24" />,
  housing: <HousingAndCommunityDevelopmentIcon width="24" height="24" />,
  immigrants: <ImmigrantsAndForeignNationalsIcon width="24" height="24" />,
  labor: <LaborAndEmploymentIcon width="24" height="24" />,
  law: <LawAndJudiciaryIcon width="24" height="24" />,
  publicResources: <PublicAndNaturalResourcesIcon width="24" height="24" />,
  social: <SocialServicesIcon width="24" height="24" />,
  sports: <SportsAndRecreationIcon width="24" height="24" />,
  taxation: <TaxationIcon width="24" height="24" />,
  technology: <TechnologyAndCommunicationsIcon width="24" height="24" />,
  transportation: <TransportationAndPublicWorksIcon width="24" height="24" />
}

export type IconType = keyof typeof SVG_MAP

type ProfilePriorities = {
  inTheirOwnWords?: string
  priorityOneIcon?: IconType
  priorityOneText?: string
  priorityTwoIcon?: IconType
  priorityTwoText?: string
  priorityThreeIcon?: IconType
  priorityThreeText?: string
}

type UpdateProfilePriorities = {
  inTheirOwnWords: string
  priorityOneIcon: IconType
  priorityOneText: string
  priorityTwoIcon: IconType
  priorityTwoText: string
  priorityThreeIcon: IconType
  priorityThreeText: string
}

type Props = {
  profile: ProfilePriorities
  actions: ProfileHook
  uid?: string
  setFormUpdated?: any
  className?: string
}

const PriorityBlock = styled(TabBlock)`
  border-left: 4px solid #1a3185;
  margin-bottom: 10px;
  padding: 14px 16px;
`

const PriorityTitle = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #0b0a3e;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
`

const PriorityWords = styled.div`
  font-size: 14px;
  color: #212529;
  line-height: 1.75;
  font-style: italic;
`

function MenuOptions() {
  return (
    <>
      <option value="" disabled>
        Select Menu
      </option>
      <option value="commerce">Commerce</option>
      <option value="crime">Crime and Law Enforcement</option>
      <option value="economics">Economics and Public Finance</option>
      <option value="education">Education</option>
      <option value="emergency">Emergency Management</option>
      <option value="energy">Energy</option>
      <option value="environment">Environmental Protection</option>
      <option value="families">Families</option>
      <option value="fda">Food Drugs and Alcohol</option>
      <option value="government">Government Operations and Elections</option>
      <option value="healthcare">Healthcare</option>
      <option value="housing">Housing and Community Development</option>
      <option value="immigrants">Immigrants and Foreign Nationals</option>
      <option value="labor">Labor and Employment</option>
      <option value="law">Law and Judiciary</option>
      <option value="publicResources">Public and Natural Resources</option>
      <option value="social">Social Services</option>
      <option value="sports">Sports and Recreation</option>
      <option value="taxation">Taxation</option>
      <option value="technology">Technology and Communications</option>
      <option value="transportation">Transportation and Public Works</option>
    </>
  )
}

async function updatePriorities(
  { actions }: Props,
  data: UpdateProfilePriorities
) {
  const {
    updateInTheirOwnWords,
    updatePriorityOneIcon,
    updatePriorityOneText,
    updatePriorityTwoIcon,
    updatePriorityTwoText,
    updatePriorityThreeIcon,
    updatePriorityThreeText
  } = actions

  await updateInTheirOwnWords(data.inTheirOwnWords)
  await updatePriorityOneIcon(data.priorityOneIcon)
  await updatePriorityOneText(data.priorityOneText)
  await updatePriorityTwoIcon(data.priorityTwoIcon)
  await updatePriorityTwoText(data.priorityTwoText)
  await updatePriorityThreeIcon(data.priorityThreeIcon)
  await updatePriorityThreeText(data.priorityThreeText)
}

export function PrioritiesTab({
  court,
  legislatorData,
  legislatorId,
  memberCode
}: {
  court: number
  legislatorData: any[]
  legislatorId: string
  memberCode: string
}) {
  const { user } = useAuth()
  const uid = user?.uid

  let pageOwner = false
  if (uid === legislatorId) {
    pageOwner = true
  }

  const userResult = useProfile()

  if (userResult.profile && pageOwner) {
    // the user is the legislator who owns this page
    // therefore they get edit privledges
    return (
      <EditablePriorities
        actions={userResult}
        court={court}
        memberCode={memberCode}
        profile={userResult.profile}
      />
    )
  }

  // the user is not the legislator who owns this page
  // therefore they get read-only privledges
  return <ReadonlyPriorities legislatorData={legislatorData} />
}

function EditablePriorities({
  actions,
  court,
  memberCode,
  profile
}: {
  actions: ProfileHook
  court: number
  memberCode: string
  profile: ProfilePriorities
}) {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit
  } = useForm<UpdateProfilePriorities>()
  const {
    inTheirOwnWords,
    priorityOneIcon,
    priorityOneText,
    priorityTwoIcon,
    priorityTwoText,
    priorityThreeIcon,
    priorityThreeText
  }: ProfilePriorities = profile
  const [formUpdated, setFormUpdated] = useState(false)
  const { t } = useTranslation("legislators")

  const currentOneOption = priorityOneIcon || "commerce"
  const currentTwoOption = priorityTwoIcon || "commerce"
  const currentThreeOption = priorityThreeIcon || "commerce"
  const [selectedOneOption, setSelectedOneOption] = useState<IconType>(
    priorityOneIcon ? priorityOneIcon : "commerce"
  )
  const [selectedTwoOption, setSelectedTwoOption] = useState<IconType>(
    priorityTwoIcon ? priorityTwoIcon : "commerce"
  )
  const [selectedThreeOption, setSelectedThreeOption] = useState<IconType>(
    priorityThreeIcon ? priorityThreeIcon : "commerce"
  )

  const handleOneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOneOption(e.target.value as IconType)
  }
  const handleTwoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTwoOption(e.target.value as IconType)
  }
  const handleThreeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedThreeOption(e.target.value as IconType)
  }

  const onSubmit = handleSubmit(async update => {
    await updatePriorities({ profile, actions }, update)
    location.assign(`/legislators/${court}/${memberCode}`)
    setFormUpdated(false)
  })

  useEffect(() => {
    setFormUpdated(isDirty)
  }, [isDirty, setFormUpdated])

  return (
    <>
      <PriorityBlock>
        <Form onSubmit={onSubmit}>
          <div className={`d-flex justify-content-between`}>
            <PriorityTitle className={`align-self-center d-inline my-1`}>
              {t("inTheirOwnWords")}
            </PriorityTitle>

            <SubmitButton
              type="submit"
              className={`btn btn-primary d-inline m-1 w-auto`}
              disabled={!formUpdated}
            >
              {t("submit")}
            </SubmitButton>
          </div>

          <Input
            as="textarea"
            {...register("inTheirOwnWords")}
            style={{ fontSize: "11px", height: "10rem" }}
            className="mt-3"
            label={t("editWords")}
            defaultValue={inTheirOwnWords ? inTheirOwnWords : t("addWords")}
          />
        </Form>
      </PriorityBlock>

      <PriorityBlock>
        <Form onSubmit={onSubmit}>
          <div className="d-flex justify-content-between">
            <PriorityTitle className={`align-self-center d-inline my-1`}>
              Select an Icon and Text for Priority One
            </PriorityTitle>

            <SubmitButton
              type="submit"
              className={`btn btn-primary d-inline m-1 w-auto`}
            >
              {t("submit")}
            </SubmitButton>
          </div>

          <div className="mb-2">{SVG_MAP[currentOneOption]} Current Icon</div>

          <div className="d-flex align-items-center justify-content-between">
            <div className="me-3 text-nowrap">
              {SVG_MAP[selectedOneOption]} Selected Icon
            </div>

            <select
              className="form-select"
              {...register("priorityOneIcon")}
              id="choices"
              value={selectedOneOption}
              onChange={handleOneChange}
              required
            >
              <MenuOptions />
            </select>
          </div>

          <div>
            <Input
              as="textarea"
              {...register("priorityOneText")}
              style={{ fontSize: "11px", height: "10rem" }}
              className="mt-2"
              label={"Edit Text:"}
              defaultValue={priorityOneText ? priorityOneText : t("addWords")}
            />
          </div>
        </Form>
      </PriorityBlock>

      <PriorityBlock>
        <Form onSubmit={onSubmit}>
          <div className="d-flex justify-content-between">
            <PriorityTitle className={`align-self-center d-inline my-1`}>
              Select an Icon and Text for Priority Two
            </PriorityTitle>

            <SubmitButton
              type="submit"
              className={`btn btn-primary d-inline m-1 w-auto`}
            >
              {t("submit")}
            </SubmitButton>
          </div>

          <div className="mb-2">{SVG_MAP[currentTwoOption]} Current Icon</div>

          <div className="d-flex align-items-center justify-content-between">
            <div className="me-3 text-nowrap">
              {SVG_MAP[selectedTwoOption]} Selected Icon
            </div>

            <select
              className="form-select"
              {...register("priorityTwoIcon")}
              id="choices"
              value={selectedTwoOption}
              onChange={handleTwoChange}
              required
            >
              <MenuOptions />
            </select>
          </div>

          <div>
            <Input
              as="textarea"
              {...register("priorityTwoText")}
              style={{ fontSize: "11px", height: "10rem" }}
              className="mt-2"
              label={"Edit Text:"}
              defaultValue={priorityTwoText ? priorityTwoText : t("addWords")}
            />
          </div>
        </Form>
      </PriorityBlock>

      <PriorityBlock>
        <Form onSubmit={onSubmit}>
          <div className="d-flex justify-content-between">
            <PriorityTitle className={`align-self-center d-inline my-1`}>
              Select an Icon and Text for Priority Three
            </PriorityTitle>

            <SubmitButton
              type="submit"
              className={`btn btn-primary d-inline m-1 w-auto`}
            >
              {t("submit")}
            </SubmitButton>
          </div>

          <div className="mb-2">{SVG_MAP[currentThreeOption]} Current Icon</div>

          <div className="d-flex align-items-center justify-content-between">
            <div className="me-3 text-nowrap">
              {SVG_MAP[selectedThreeOption]} Selected Icon
            </div>

            <select
              className="form-select"
              {...register("priorityThreeIcon")}
              id="choices"
              value={selectedThreeOption}
              onChange={handleThreeChange}
              required
            >
              <MenuOptions />
            </select>
          </div>

          <div>
            <Input
              as="textarea"
              {...register("priorityThreeText")}
              style={{ fontSize: "11px", height: "10rem" }}
              className="mt-2"
              label={"Edit Text:"}
              defaultValue={
                priorityThreeText ? priorityThreeText : t("addWords")
              }
            />
          </div>
        </Form>
      </PriorityBlock>
    </>
  )
}

function ReadonlyPriorities({ legislatorData }: { legislatorData: any[] }) {
  const { t } = useTranslation("legislators")

  return (
    <>
      <PriorityBlock>
        <PriorityTitle className={`my-1`}>{t("inTheirOwnWords")}</PriorityTitle>

        <PriorityWords style={{ whiteSpace: "pre-wrap" }}>
          <span>&ldquo;</span>

          {legislatorData[0]?.inTheirOwnWords
            ? legislatorData[0].inTheirOwnWords
            : t("inTheirOwnWordsEmpty")}

          <span>&rdquo;</span>
        </PriorityWords>
      </PriorityBlock>

      <PriorityBlock>
        <PriorityTitle className={`my-1`}>Priority One</PriorityTitle>
      </PriorityBlock>
    </>
  )
}
