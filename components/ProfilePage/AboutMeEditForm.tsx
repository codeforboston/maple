import clsx from "clsx"
import { ChangeEvent } from "react"
import { FormCheck } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Form, Row } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import Input from "../forms/Input"
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
  await updateSocial("linkedIn", data.linkedIn)
  await updateSocial("twitter", data.twitter)
  await updateAbout(data.aboutYou)
  await updateDisplayName(data.name)

  console.log(profile)
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

  const { updateIsOrganization } = actions

  const onSubmit = handleSubmit(data => {
    updateProfile({ profile, actions, uid }, data)
  })

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
                {...register("public")}
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
        <div className={`mx-1 mx-md-3 d-flex flex-column gap-3`}>
          <Form.FloatingLabel label="User Type" className="mb-3">
            <Form.Select
              className="bg-white"
              {...register("organization")}
              defaultValue={organization ? "organization" : "individual"}
              onChange={handleChooseUserType}
            >
              <option value="organization">Organization</option>
              <option value="individual">Individual</option>
            </Form.Select>
          </Form.FloatingLabel>
          <Input label="Name" defaultValue={displayName} />
          <Input
            as="textarea"
            {...register("aboutYou")}
            style={{ height: "10rem" }}
            label="About You"
            defaultValue={about}
          />
          <div className={clsx("w-100", organization && "row")}>
            {organization && <ImageInput />}
            <div className="col">
              <Input
                label="Twitter Username"
                defaultValue={social?.twitter}
                {...register("twitter")}
              />
              <Input
                label="LinkedIn Username"
                defaultValue={social?.linkedIn}
                {...register("linkedIn")}
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
