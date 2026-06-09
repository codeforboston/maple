import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { Form, Row, Spinner } from "../../bootstrap"
import { Profile, useProfile } from "../../db"
import Input from "../../forms/Input"

import { useAuth } from "components/auth"

type UpdateProfileData = {
  legislatorBio: string
}

export function Biography({ pageId }: { pageId: string }) {
  const { user } = useAuth()
  const uid = user?.uid
  // `useProfile` needs to be replaced with a function that uses the pageId
  // instead of the current user's id
  const result = useProfile()

  let pageOwner = false

  if (uid === pageId) {
    pageOwner = true
  }

  if (result.loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

  if (result?.profile && pageOwner) {
    // the user is the legislator whose page this is
    // therefore they get edit privledges
    return <SelfBiography pageId={pageId} profile={result.profile} />
  }

  // the user is not the legislator whose page this is
  // therefore they get read-only privledges
  return <LegislatorBiography />
}

function LegislatorBiography() {
  return <div>Sample Biography</div>
}

const BioBlock = styled.div`
  background-color: white;
  border: "1px #ced4da solid";
  border-radius: 5px;
  margin-top: 8px;
  padding: 8px 16px;
`

const BioButton = styled.button`
  font-size: 11px;
`

const BioTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #0b0a3e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
`

function SelfBiography({
  pageId,
  profile
}: {
  pageId: string
  profile: Profile
}) {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit
  } = useForm<UpdateProfileData>()

  // `about` should be replaced with a property along the lines of legislatorBio
  // or whatever is appropriate
  const { about }: Profile = profile

  const onSubmit = handleSubmit(async update => {
    // await updateProfile({ actions }, update)
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
            Biography
          </BioTitle>
          <BioButton
            type="submit"
            className={`btn btn-primary d-inline m-1 p-1 w-auto`}
            disabled={!formUpdated}
          >
            Submit
          </BioButton>
        </div>
        <Input
          as="textarea"
          {...register("legislatorBio")}
          style={{ height: "10rem" }}
          className="mt-3"
          label={t("editBio")}
          // `about` should be replaced with a property along the lines of legislatorBio
          // or whatever is appropriate
          defaultValue={about}
        />
      </Form>
    </BioBlock>
  )
}
