import { TabBlock } from "../LegislatorComponents"

import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { Form } from "../../bootstrap"
import { Profile, ProfileHook, useProfile } from "../../db"
import Input from "../../forms/Input"
import { SidebarBlock, SidebarTitle } from "../LegislatorSidebar"

import { useAuth } from "components/auth"
import {
  updateProfile,
  UpdateProfileData
} from "components/EditProfilePage/PersonalInfoTab"

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

  console.log("leg data: ", legislatorData)

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
  profile: Profile
}) {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit
  } = useForm<UpdateProfileData>()

  const { about }: Profile = profile

  const onSubmit = handleSubmit(async update => {
    await updateProfile({ profile, actions }, update)
    location.assign(`/legislators/${court}/${memberCode}`)
    setFormUpdated(false)
  })

  const { t } = useTranslation("legislators")
  const [formUpdated, setFormUpdated] = useState(false)

  useEffect(() => {
    setFormUpdated(isDirty)
  }, [isDirty, setFormUpdated])

  return (
    <SidebarBlock>
      Editable Priorities
      {/* <Form onSubmit={onSubmit}>
        <div className={`d-flex justify-content-between`}>
          <SidebarTitle className={`align-self-center d-inline my-1`}>
            {t("biography")}
          </SidebarTitle>
          <BioButton
            type="submit"
            className={`btn btn-primary d-inline m-1 w-auto`}
            disabled={!formUpdated}
          >
            {t("submit")}
          </BioButton>
        </div>
        <Input
          as="textarea"
          {...register("aboutYou")}
          style={{ fontSize: "11px", height: "10rem" }}
          className="mt-3"
          label={t("editBio")}
          defaultValue={about ? about : t("addBio")}
        />
      </Form> */}
    </SidebarBlock>
  )
}

function ReadonlyPriorities({ legislatorData }: { legislatorData: any[] }) {
  const { t } = useTranslation("legislators")

  return (
    <SidebarBlock>
      <SidebarTitle className={`my-1`}>{t("biography")}</SidebarTitle>
      <div style={{ whiteSpace: "pre-wrap" }}>
        {legislatorData[0]?.about ? legislatorData[0].about : t("notClaimed")}
      </div>
    </SidebarBlock>
  )
}

// {
//   return (
//     <TabBlock>
//       <div>In their own words</div>
//       <div>Key Priorites</div>
//       <div>
//         <div>1</div>
//         <div>2</div>
//         <div>3</div>
//       </div>
//       <div>Last updated ?</div>
//     </TabBlock>
//   )
// }
