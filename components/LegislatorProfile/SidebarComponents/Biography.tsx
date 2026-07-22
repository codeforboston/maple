import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { Form } from "../../bootstrap"
import { Profile, ProfileHook, useProfile } from "../../db"
import Input from "../../forms/Input"

import { useAuth } from "components/auth"
import {
  updateProfile,
  UpdateProfileData
} from "components/EditProfilePage/PersonalInfoTab"

const BioBlock = styled.div`
  background-color: white;
  border-color: #b8c0c9;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  font-size: 11px;
  padding: 16px;
`

const BioButton = styled.button`
  font-size: 9px;
  padding: 2px;
`

const BioTitle = styled.div`
  font-weight: 700;
  color: #0b0a3e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
`

export function Biography({
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
      <EditableBiography
        actions={userResult}
        court={court}
        memberCode={memberCode}
        profile={userResult.profile}
      />
    )
  }

  // the user is not the legislator who owns this page
  // therefore they get read-only privledges
  return <ReadonlyBiography legislatorData={legislatorData} />
}

function EditableBiography({
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
    <BioBlock>
      <Form onSubmit={onSubmit}>
        <div className={`d-flex justify-content-between`}>
          <BioTitle className={`align-self-center d-inline my-1`}>
            {t("biography")}
          </BioTitle>
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
      </Form>
    </BioBlock>
  )
}

function ReadonlyBiography({ legislatorData }: { legislatorData: any[] }) {
  const { t } = useTranslation("legislators")

  return (
    <BioBlock>
      <BioTitle className={`my-1`}>{t("biography")}</BioTitle>
      <div style={{ whiteSpace: "pre-wrap" }}>
        {legislatorData[0]?.about ? legislatorData[0].about : t("notClaimed")}
      </div>
    </BioBlock>
  )
}
