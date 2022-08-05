import clsx from "clsx"
import { ChangeEvent, FormEvent } from "react"
import { FormCheck, FormControlProps } from "react-bootstrap"
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

type ProfileKey = keyof Profile

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

  await updateIsPublic(data.public)
  data.linkedIn && (await updateSocial("linkedIn", data.linkedIn))
  data.twitter && (await updateSocial("twitter", data.twitter))
  data.aboutYou && (await updateAbout(data.aboutYou))
  data.name && (await updateDisplayName(data.name))

  console.log(profile)
}

export function AboutMeEditForm({ profile, actions, uid }: Props) {
  const {
    displayName,
    about,
    organization,
    public: isPublic,
    social
  }: Profile = profile

  const { updateIsOrganization } = actions

  const getFormValues = (
    e: FormEvent<HTMLFormElement>,
    items: ProfileKey[]
  ) => {
    const form = e.target as HTMLFormElement

    const data: { [name: string]: string | number | boolean | undefined } = {}

    items.forEach(i => {
      const current = profile[i]
      i === "public"
        ? (data[i] = form[i]?.checked ?? current)
        : (data[i] = form[i]?.value ?? current)
    })

    return data as UpdateProfileData
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const update = getFormValues(e, [
      "name",
      "aboutYou",
      "twitter",
      "linkedIn",
      "public",
      "organization",
      "profileImage"
    ] as ProfileKey[])

    await updateProfile({ profile, actions, uid }, update)
  }

  const handleChooseUserType = async (e: ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value)
    await updateIsOrganization(e.target.value === "organization")
  }

  return (
    <TitledSectionCard>
      <Form onSubmit={onSubmit}>
        <Header
          title={"About You"}
          bug={
            <Row className={`justify-content-center`}>
              <FormCheck
                name="public"
                className={`col-auto`}
                type="checkbox"
                defaultChecked={isPublic}
              />
              <Form.Label htmlFor="public" className={`col`}>
                Allow others to see your profile
              </Form.Label>
            </Row>
          }
        ></Header>
        <div className={`mx-1 mx-md-3`}>
          <Form.FloatingLabel label="User Type" className="mb-3">
            <Form.Select
              name="organization"
              className="bg-white"
              defaultValue={organization ? "organization" : "individual"}
              onChange={handleChooseUserType}
            >
              <option value="organization">Organization</option>
              <option value="individual">Individual</option>
            </Form.Select>
          </Form.FloatingLabel>
          <TextInput name="name" label="Name" defaultValue={displayName} />
          <TextAreaInput
            name="aboutYou"
            label="About You"
            placeHolder={
              organization
                ? "Write something about your organization"
                : "Write something about yourself"
            }
            defaultValue={about}
          />
          <div className={clsx("w-100", organization && "row")}>
            {organization && <ImageInput />}
            <div className="col">
              <TextInput
                label="Twitter Username"
                name="twitter"
                defaultValue={social?.twitter}
              />
              <TextInput
                label="LinkedIn Username"
                name="linkedIn"
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
  name: string
  defaultValue?: string
  className?: string
  placeHolder?: string
}

export const TextInput = ({
  label,
  name,
  defaultValue,
  className
}: TextInputProps & FormControlProps) => {
  return (
    <Form.FloatingLabel
      id={name || label?.replace(" ", "")}
      label={label || name}
      className={clsx(className || "mb-3")}
    >
      <Form.Control
        name={name || label}
        type="text"
        defaultValue={defaultValue}
        className={`bg-white w-100`}
      />
    </Form.FloatingLabel>
  )
}

export const TextAreaInput = ({
  label,
  name,
  defaultValue,
  className,
  placeHolder
}: TextInputProps) => {
  return (
    <Form.FloatingLabel
      id={name}
      label={label || name}
      className={clsx(className || "mb-3")}
    >
      <Form.Control
        name={name}
        as="textarea"
        type="text"
        defaultValue={defaultValue}
        placeholder={placeHolder}
        className={`bg-white w-100`}
        style={{ height: "300px" }}
      />
    </Form.FloatingLabel>
  )
}
