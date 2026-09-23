import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { Form } from "../../bootstrap"
import { Profile, ProfileHook, useProfile } from "../../db"
import Input from "../../forms/Input"
import { SubmitButton, TabBlock } from "../LegislatorComponents"
import { SidebarTitle } from "../LegislatorSidebar"

import { useAuth } from "components/auth"

type UpdateProfilePriorities = {
  inTheirOwnWords: string
}

type Props = {
  profile: Profile
  actions: ProfileHook
  uid?: string
  setFormUpdated?: any
  className?: string
}

async function updatePriorities(
  { actions }: Props,
  data: UpdateProfilePriorities
) {
  const { updateInTheirOwnWords } = actions

  await updateInTheirOwnWords(data.inTheirOwnWords)
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
  } = useForm<UpdateProfilePriorities>()

  const { inTheirOwnWords }: Profile = profile

  const onSubmit = handleSubmit(async update => {
    await updatePriorities({ profile, actions }, update)
    location.assign(`/legislators/${court}/${memberCode}`)
    setFormUpdated(false)
  })

  const { t } = useTranslation("legislators")
  const [formUpdated, setFormUpdated] = useState(false)

  useEffect(() => {
    setFormUpdated(isDirty)
  }, [isDirty, setFormUpdated])

  return (
    <TabBlock>
      Editable Priorities
      <Form onSubmit={onSubmit}>
        <div className={`d-flex justify-content-between`}>
          <SidebarTitle className={`align-self-center d-inline my-1`}>
            {t("biography")}
          </SidebarTitle>
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
          label={t("editBio")}
          defaultValue={inTheirOwnWords ? inTheirOwnWords : t("addBio")}
        />
      </Form>
    </TabBlock>
  )
}

function ReadonlyPriorities({ legislatorData }: { legislatorData: any[] }) {
  const { t } = useTranslation("legislators")

  return (
    <TabBlock>
      <SidebarTitle className={`my-1`}>{t("biography")}</SidebarTitle>
      <div style={{ whiteSpace: "pre-wrap" }}>
        {legislatorData[0]?.inTheirOwnWords
          ? legislatorData[0].inTheirOwnWords
          : t("notClaimed")}
      </div>
    </TabBlock>
  )
}
