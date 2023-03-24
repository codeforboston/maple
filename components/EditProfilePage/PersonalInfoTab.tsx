import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Form, Row, Col } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import Input from "../forms/Input"
import { TitledSectionCard } from "../shared"
import { StyledSaveButton } from "./StyledEditProfileComponents"
import { ImageInput } from "./ImageInput"
import { YourLegislators } from "./YourLegislators"
import { OrgCategory, OrgCategories } from "components/auth"
import { minLength } from "ra-core"

type UpdateProfileData = {
  name: string
  aboutYou: string
  twitter: string
  linkedIn: string
  instagram: string
  fb: string
  publicEmail: string
  publicPhone: number
  website: string
  organization: boolean
  profileImage: any
  orgCategory: OrgCategory
}

type Props = {
  profile: Profile
  actions: ProfileHook
  uid?: string
  setFormUpdated?: any
  className?: string
  isOrg?: boolean
}

async function updateProfile(
  { profile, actions, uid }: Props,
  data: UpdateProfileData
) {
  const {
    updateSocial,
    updateAbout,
    updateDisplayName,
    updateFullName,
    updateContactInfo,
    updateOrgCategory
  } = actions

  await updateContactInfo("publicEmail", data.publicEmail)
  await updateContactInfo("publicPhone", data.publicPhone)
  await updateContactInfo("website", data.website)
  await updateOrgCategory(data.orgCategory)

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
  setFormUpdated,
  isOrg
}: Props) {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    getValues
  } = useForm<UpdateProfileData>()

  const {
    displayName,
    about,
    role,
    social,
    contactInfo,
    profileImage,
    orgCategories
  }: Profile = profile

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

  const [category, setCategory] = useState(
    profile.orgCategories ? profile.orgCategories : OrgCategories[0]
  )

  return (
    <Form onSubmit={onSubmit}>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column`}>
          <h4 className="mb-3">General Information</h4>
          <Input
            label="Name"
            {...register("name", {
              required: "A name is required"
            })}
            defaultValue={displayName}
            error={errors.name?.message}
          />
          <Input
            as="textarea"
            {...register("aboutYou")}
            style={{ height: "20rem" }}
            className="mt-3"
            label="Write something about yourself"
            defaultValue={about}
          />
          {isOrg && (
            <Form.Group className="mt-3" controlId="orgCategory">
              <Form.FloatingLabel label="Select an organization cateogry">
                <Form.Select
                  as="select"
                  value={category}
                  {...register("orgCategory", {
                    onChange: e => setCategory(e.value)
                  })}
                >
                  {OrgCategories.map(c => (
                    <>
                      <option value={c}>{c}</option>
                    </>
                  ))}
                </Form.Select>
              </Form.FloatingLabel>
            </Form.Group>
          )}

          <div className="mb-3">
            {/* {isOrg && <ImageInput />} */}
            <h4 className="mb-3 mt-5">Social Media</h4>
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
            {isOrg && (
              <>
                <div className="row mt-3">
                  <Input
                    label="Instagram Username"
                    defaultValue={social?.instagram}
                    className="w-50"
                    {...register("instagram")}
                  />
                  <Input
                    label="Facebook Link"
                    defaultValue={social?.fb}
                    className="w-50"
                    {...register("fb")}
                  />
                </div>
                <h4 className="mb-3 mt-5">Contact Information</h4>
                <Row>
                  <Input
                    label="Contact Email"
                    defaultValue={contactInfo?.publicEmail}
                    {...register("publicEmail")}
                  />
                </Row>
                <Row className="mt-3">
                  <Input
                    label="Contact Phone Number"
                    defaultValue={contactInfo?.publicPhone}
                    {...register("publicPhone", {
                      minLength: {
                        value: 10,
                        message:
                          "Your phone number should be at least 10 numbers long"
                      },
                      maxLength: {
                        value: 10,
                        message:
                          "Your phone number can not be more than 10 numbers long"
                      },
                      validate: () => {
                        const phoneNum = getValues("publicPhone")
                        return isNaN(phoneNum)
                          ? "Please enter a phone number that only consists of numbers"
                          : undefined
                      }
                    })}
                    error={errors.publicPhone?.message}
                  />
                </Row>
                <Row className="mt-3">
                  <Input
                    label="Website"
                    defaultValue={contactInfo?.website}
                    {...register("website")}
                  />
                </Row>
              </>
            )}
          </div>
        </div>
      </TitledSectionCard>

      {!isOrg && (
        <TitledSectionCard>
          <h2>Your Legislators</h2>
          <YourLegislators />
        </TitledSectionCard>
      )}

      <Row>
        <Col>
          <StyledSaveButton type="submit">
            Save Personal Information
          </StyledSaveButton>
        </Col>
      </Row>
    </Form>
  )
}
