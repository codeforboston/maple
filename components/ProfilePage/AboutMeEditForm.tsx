import clsx from "clsx"
import { useEffect, useState } from "react"
import { FormCheck, FormControlProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Form, Row } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import { TitledSectionCard } from "../shared"
import { Header } from "../shared/TitledSectionCard"
import { ImageInput } from "./ImageInput"
import { YourLegislators } from "./YourLegislators"

type UpdateProfileData = {
  name: string
  aboutYou: string
  twitter: string
  linkedIn: string
  public: boolean
  organization: boolean
  profileImage: any
}

type Props = {
  profile: Profile
  actions: ProfileHook
  uid?: string
}

async function updateProfile(
  { profile, actions, uid }: Props,
  data: UpdateProfileData
) {
  const { updateIsPublic, updateSocial, updateAbout, updateDisplayName } =
    actions

  console.log(data.organization, data.twitter)
  await updateIsPublic(data.public)
  await updateSocial("linkedIn", data.linkedIn)
  await updateSocial("twitter", data.twitter)
  await updateAbout(data.aboutYou)
  await updateDisplayName(data.name)
}

export function AboutMeEditForm({ profile, actions, uid }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<UpdateProfileData>()

  const {
    displayName,
    about,
    organization,
    public: isPublic,
    social
  }: Profile = profile

  const [userType, setUserType] = useState(
    organization ? "organization" : "individual"
  )

  const { updateIsOrganization } = actions

  const onSubmit = handleSubmit(async update => {
    await updateProfile({ profile, actions, uid }, update)
  })

  useEffect(() => {
    if (organization === undefined) return
    setUserType(organization ? "organization" : "individual")
  }, [organization])

  console.log(organization, userType)

  return (
    <TitledSectionCard>
      <Form onSubmit={onSubmit}>
        <Header
          title={"About You"}
          bug={
            <Row className={`justify-content-center`}>
              <FormCheck
                className={`col-auto`}
                type="checkbox"
                defaultChecked={isPublic}
                {...register("public")}
              />
              <Form.Label className={`col`}>
                Allow others to see your profile
              </Form.Label>
            </Row>
          }
        ></Header>
        <div className={`mx-1 mx-md-3`}>
          <Form.FloatingLabel label="User Type" className="mb-3">
            <Form.Select
              className="bg-white"
              defaultValue={userType}
              onChange={e => {
                updateIsOrganization(e.target.value === "organization")
              }}
            >
              <option value="organization">Organization</option>
              <option value="individual">Individual</option>
            </Form.Select>
          </Form.FloatingLabel>
          <TextInput
            name="Name"
            registerProps={register("name")}
            defaultValue={displayName}
          />
          <TextAreaInput
            name="AboutYou"
            placeHolder={
              organization
                ? "Write something about your organization"
                : "Write something about yourself"
            }
            registerProps={register("aboutYou")}
            defaultValue={about}
          />
          <div className={clsx("w-100", organization && "row")}>
            {organization && <ImageInput />}
            <div className="col">
              <TextInput
                label="Twitter Username"
                name="twitter"
                registerProps={register("twitter")}
                defaultValue={social?.twitter}
              />
              <TextInput
                label="LinkedIn Username"
                name="linkedIn"
                registerProps={register("linkedIn")}
                defaultValue={social?.linkedIn}
              />
            </div>
          </div>
          <Form.Group className="d-flex col-auto m-auto">
            <Button className="flex-grow-0 mt-5 mx-auto" type="submit">
              Save Profile
            </Button>
          </Form.Group>
        </div>
      </Form>
      {!organization && (
        <>
          <Header title="Your Legislators"></Header>
          <YourLegislators />
        </>
      )}
    </TitledSectionCard>
  )
}

export type TextInputProps = {
  label?: string
  name?: string
  defaultValue?: string
  registerProps: any
  className?: string
  placeHolder?: string
}

export const TextInput = ({
  label,
  name,
  defaultValue,
  registerProps,
  className
}: TextInputProps & FormControlProps) => {
  return (
    <Form.FloatingLabel
      id={name || label?.replace(" ", "")}
      label={label || name}
      className={clsx(className || "mb-3")}
    >
      <Form.Control
        name={name}
        type="text"
        defaultValue={defaultValue}
        {...registerProps}
        className={`bg-white w-100`}
      />
    </Form.FloatingLabel>
  )
}

export const TextAreaInput = ({
  label,
  name,
  defaultValue,
  registerProps,
  className
}: TextInputProps) => {
  return (
    <Form.FloatingLabel
      id={name || label?.replace(" ", "")}
      label={label || name}
      className={clsx(className || "mb-3")}
    >
      <Form.Control
        name={name}
        as="textarea"
        type="text"
        defaultValue={defaultValue}
        {...registerProps}
        className={`bg-white w-100`}
        style={{ height: "300px" }}
      />
    </Form.FloatingLabel>
  )
}
