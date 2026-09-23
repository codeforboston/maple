import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { Form } from "../../bootstrap"
import { Profile, ProfileHook, useProfile } from "../../db"
import Input from "../../forms/Input"
import { SubmitButton, TabBlock } from "../LegislatorComponents"

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
  const [formUpdated, setFormUpdated] = useState(false)
  const { t } = useTranslation("legislators")

  const onSubmit = handleSubmit(async update => {
    await updatePriorities({ profile, actions }, update)
    location.assign(`/legislators/${court}/${memberCode}`)
    setFormUpdated(false)
  })

  useEffect(() => {
    setFormUpdated(isDirty)
  }, [isDirty, setFormUpdated])

  return (
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
          className="mt-3"
          label={t("editWords")}
          defaultValue={inTheirOwnWords ? inTheirOwnWords : t("addWords")}
        />
      </Form>
    </PriorityBlock>
  )
}

function ReadonlyPriorities({ legislatorData }: { legislatorData: any[] }) {
  const { t } = useTranslation("legislators")

  return (
    <>
      {legislatorData[0]?.inTheirOwnWords ? (
        <PriorityBlock>
          <PriorityTitle className={`my-1`}>
            {t("inTheirOwnWords")}
          </PriorityTitle>
          <PriorityWords style={{ whiteSpace: "pre-wrap" }}>
            <span>&ldquo;</span>
            {legislatorData[0]?.inTheirOwnWords}
            <span>&rdquo;</span>
          </PriorityWords>
        </PriorityBlock>
      ) : (
        <></>
      )}
    </>
  )
}
