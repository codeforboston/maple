import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { Form, Row, Spinner } from "../../bootstrap"
import { Profile, ProfileHook, useProfile } from "../../db"
import Input from "../../forms/Input"

import { useAuth } from "components/auth"
import {
  updateProfile,
  UpdateProfileData
} from "components/EditProfilePage/PersonalInfoTab"

const BioBlock = styled.div`
  background-color: white;
  border: "1px #ced4da solid";
  border-radius: 5px;
  font-size: 11px;
  margin-top: 8px;
  padding: 8px 16px;
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
  pageId,
  publicProfile
}: {
  pageId: string
  publicProfile: Profile | undefined
}) {
  const { user } = useAuth()
  const uid = user?.uid
  const pageOwnerResult = useProfile()

  let pageOwner = false

  if (uid === pageId) {
    pageOwner = true
  }

  if (pageOwnerResult.loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

  if (pageOwnerResult.profile && pageOwner) {
    // the user is the legislator whose page this is
    // therefore they get edit privledges
    return (
      <SelfBiography
        actions={pageOwnerResult}
        pageId={pageId}
        profile={pageOwnerResult.profile}
      />
    )
  }

  if (publicProfile) {
    // the user is not the legislator whose page this is
    // therefore they get read-only privledges
    return <LegislatorBiography profile={publicProfile} />
  }
}

function LegislatorBiography({ profile }: { profile: Profile }) {
  const { about }: Profile = profile
  const { t } = useTranslation("legislators")

  return (
    <BioBlock>
      <BioTitle className={`my-1`}>{t("biography")}</BioTitle>
      {about ? (
        <div style={{ whiteSpace: "pre-wrap" }}>{about}</div>
      ) : (
        <div style={{ whiteSpace: "pre-wrap" }}>{t("notClaimed")}</div>
      )}
    </BioBlock>
  )
}

function SelfBiography({
  actions,
  pageId,
  profile
}: {
  actions: ProfileHook
  pageId: string
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
    location.assign(`/legislators/profile?id=${pageId}`)
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
          defaultValue={about}
        />
      </Form>
    </BioBlock>
  )
}
