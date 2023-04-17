import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Form, Row, Col, Button } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import Input from "../forms/Input"
import { TitledSectionCard } from "../shared"
import { StyledSaveButton } from "./StyledEditProfileComponents"
import { YourLegislators } from "./YourLegislators"
import { OrgCategory, OrgCategories } from "components/auth"
import { TooltipButton } from "components/buttons"

type UpdateProfileData = {
  fullName: string
  displayName: string
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
  data.website && (await updateContactInfo("website", data.website))
  await updateOrgCategory(data.orgCategory)

  await updateSocial("linkedIn", data.linkedIn)
  await updateSocial("twitter", data.twitter)
  await updateSocial("instagram", data.instagram)
  await updateSocial("fb", data.fb)
  await updateAbout(data.aboutYou)
  await updateDisplayName(data.displayName)
  await updateFullName(data.fullName)
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
    fullName,
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
    orgCategories ? orgCategories : OrgCategories[0]
  )

  const tooltip =
    "At MAPLE, people are key. We want to foster a community as each person provides public testimony to empower policy change. By providing more information about yourself, it helps legislators and others see what your goals are and connect in an impactful way."

  return (
    <Form onSubmit={onSubmit}>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column`}>
          <h4 className="mb-3">General Information</h4>
          <Row>
            <Input
              label="Full Name"
              {...register("fullName", {
                required: "A name is required"
              })}
              className="w-50"
              defaultValue={fullName}
              error={errors.fullName?.message}
            />
            <Input
              label="Nickname"
              className="w-50"
              {...register("displayName")}
              defaultValue={displayName}
              error={errors.displayName?.message}
            />
          </Row>

          <Input
            as="textarea"
            {...register("aboutYou")}
            style={{ height: "10rem" }}
            className="mt-3"
            label="Write something about yourself"
            defaultValue={about}
          />
          <Row xs="auto" className="mt-2">
            <Col>
              <TooltipButton
                text="What should you write?"
                tooltip={tooltip}
                variant="link"
              />
            </Col>
          </Row>
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
                iconSrc="./twitter.svg"
                {...register("twitter")}
              />
              <Input
                label="LinkedIn Username"
                defaultValue={social?.linkedIn}
                className="w-50"
                iconSrc="./linkedin.svg"
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
                    iconSrc="./instagram.svg"
                    {...register("instagram")}
                  />
                  <Input
                    label="Facebook Link"
                    defaultValue={social?.fb}
                    className="w-50"
                    iconSrc="./facebook.svg"
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
