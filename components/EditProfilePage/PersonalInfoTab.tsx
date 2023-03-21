import clsx from "clsx"
import { ChangeEvent, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button, Form, Row, Col } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import Input from "../forms/Input"
import { TitledSectionCard } from "../shared"
import { StyledSaveButton } from "./StyledEditProfileComponents"
import { ImageInput } from "./ImageInput"
import { YourLegislators } from "./YourLegislators"

type UpdateProfileData = {
  name: string
  aboutYou: string
  twitter: string
  linkedIn: string
  instagram: string
  fb: string
  organization: boolean
  profileImage: any
}

type Props = {
  profile: Profile
  actions: ProfileHook
  uid?: string
  setFormUpdated?: any
  className?: string
}

async function updateProfile(
  { profile, actions, uid }: Props,
  data: UpdateProfileData
) {
  console.log("updating")
  const { updateSocial, updateAbout, updateDisplayName, updateFullName } =
    actions

  await updateSocial("linkedIn", data.linkedIn)
  await updateSocial("twitter", data.twitter)
  await updateSocial("instagram", data.instagram)
  await updateSocial("fb", data.fb)
  await updateAbout(data.aboutYou)
  await updateDisplayName(data.name)
  await updateFullName(data.name)
}

export function PersonalInfoTab({
  profile,
  actions,
  uid,
  className,
  setFormUpdated
}: Props) {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit
  } = useForm<UpdateProfileData>()

  const { displayName, about, role, social, profileImage }: Profile = profile

  const isOrganization = role === "organization"

  const onSubmit = handleSubmit(async update => {
    await updateProfile({ profile, actions }, update)

    handleRedirect()
  })

  const handleRedirect = () => {
    //redirect user to profile page
    location.assign(`/profile?=${uid}`)
  }

  useEffect(() => {
    setFormUpdated(isDirty)
  }, [isDirty, setFormUpdated])

  return (

      <Form onSubmit={onSubmit}>
      <TitledSectionCard className={className}>
        
          <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
            <Input
              label="Name"
              {...register("name")}
              defaultValue={displayName}
            />
            <Input
              as="textarea"
              {...register("aboutYou")}
              style={{ height: "20rem" }}
              label="Write something about yourself"
              defaultValue={about}
            />
            <div className="mb-3">
              {isOrganization && <ImageInput />}
              <div className="row">
                <Input
                  label="Twitter Username"
                  defaultValue={social?.twitter}
                  className=" w-50"
                  {...register("twitter")}
                />
                <Input
                  label="LinkedIn Username"
                  defaultValue={social?.linkedIn}
                  className="w-50"
                  {...register("linkedIn")}
                />
                </div>
                {isOrganization && (
                  <div className="row mt-3">
                  <Input
                  label="Instagram Username"
                  defaultValue={social?.instagram}
                  className="w-50"
                  {...register("instagram")}
                />
                <Input
                  label="Facebook Username"
                  defaultValue={social?.fb}
                  className="w-50"
                  {...register("fb")}
                />
                  </div>
                  

                )}
              
            </div>
          </div>

      </TitledSectionCard>
      
        {!isOrganization && (
          <TitledSectionCard>
            <h2>Your Legislators</h2>
            <YourLegislators />
          </TitledSectionCard>
        )}
     
      <Row>
        <Col>
        <StyledSaveButton type="submit">Save Personal Information</StyledSaveButton>

        </Col>
      </Row>
      </Form>

  )
}
