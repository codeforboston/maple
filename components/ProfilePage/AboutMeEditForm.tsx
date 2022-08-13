import clsx from "clsx"
import { ChangeEvent, useEffect, useState } from "react"
import { FormCheck, FormControlProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Form, Image, Row, Col } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import { TitledSectionCard } from "../shared"
import { Header } from "../shared/TitledSectionCard"
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
  setFormUpdated?: any
}

async function updateProfile(
  { profile, actions, uid }: Props,
  data: UpdateProfileData
) {
  const {
    updateIsPublic,
    updateSocial,
    updateAbout,
    updateDisplayName,
    updateProfileImage,
    updateIsOrganization
  } = actions

  await updateIsPublic(data.public)
  await updateSocial("linkedIn", data.linkedIn)
  await updateSocial("twitter", data.twitter)
  await updateAbout(data.aboutYou)
  await updateDisplayName(data.name)
  await updateIsOrganization(data.organization)
  // await updateProfileImage(data.profileImage) disabled until permissions to be updated in fb storage
}

export function AboutMeEditForm({
  profile,
  actions,
  uid,
  setFormUpdated
}: Props) {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit
  } = useForm<UpdateProfileData>()

  const {
    displayName,
    about,
    organization,
    public: isPublic,
    social,
    profileImage
  }: Profile = profile

  const userType = organization ? "organization" : "individual"

  const { updateIsOrganization } = actions

  const onSubmit = handleSubmit(async update => {
    await updateProfile({ profile, actions }, update)

    handleRedirect()
  })

  const handleRedirect = () => {
    //redirect user to profile page
    profile.organization
      ? location.assign(`/organization?id=${uid}`)
      : location.assign(`/profile?=${uid}`)
  }

  useEffect(() => {
    setFormUpdated(isDirty)
  }, [isDirty, setFormUpdated])

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
              {...register("organization")}
              defaultValue={userType}
              onChange={e =>
                updateIsOrganization(e.target.value === "organization")
              }
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
            {organization && (
              <ImageInput
                registerProps={register("profileImage")}
                imageSrc={"https://randomuser.me/api/portraits/lego/0.jpg"}
              />
            )}
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
          <Row className="align-items-center justify-content-center mb-3">
            <Col className="align-items-center" xs="auto">
              <Button className="flex-grow-0 mt-5 mx-auto" type="submit">
                Save Profile
              </Button>
            </Col>
            <Col className="align-items-center" xs="auto">
              <Button
                className="flex-grow-0 mt-5 mx-auto"
                variant="outline-dark"
                onClick={handleRedirect}
              >
                Cancel
              </Button>
            </Col>
          </Row>
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

export type ImageInputProps = {
  label?: string
  name?: string
  defaultValue?: string
  registerProps: any
  className?: string
  imageSrc?: string
}

export const ImageInput = ({
  label,
  name,
  defaultValue,
  registerProps,
  className,
  imageSrc
}: ImageInputProps) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("uploaded image event.target.value", e.target.value)
  }

  return (
    <div className="d-flex flex-row px-3 col">
      <Image
        className="bg-success"
        style={{
          objectFit: "contain",
          height: "10rem",
          width: "auto",
          borderRadius: "2rem",
          margin: "1rem"
        }}
        alt="Profile image"
        src={imageSrc}
      ></Image>
      <div className="d-flex flex-column justify-content-center align-items-start col mx-3">
        <input
          as={Button}
          variant="primary"
          id="profileimage"
          className={`bg-white d-block`}
          type="file"
          accept="image/png, image/jpg"
          {...registerProps}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
