import { ChangeEvent, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Form, Row, Col, Button } from "../bootstrap"
import { ProfileHook } from "../db"
import Input from "../forms/Input"
import { TitledSectionCard } from "../shared"
import { YourLegislators } from "./YourLegislators"
import { OrgCategory, OrgCategories } from "common/auth/types"
import { TooltipButton } from "components/buttons"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Profile } from "common/profile/types"

type UpdateProfileData = {
  fullName: string
  aboutYou: string
  twitter: string
  linkedIn: string
  instagram: string
  fb: string
  blueSky: string
  mastodon: string
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
  await updateSocial("blueSky", data.blueSky)
  await updateSocial("mastodon", data.mastodon)
  await updateSocial("fb", data.fb)
  await updateAbout(data.aboutYou)
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

  const { t } = useTranslation("editProfile")

  return (
    <Form onSubmit={onSubmit}>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column`}>
          <h4 className="mb-3">{t("forms.generalInfo")}</h4>
          <Row>
            <Input
              label={t(isOrg ? "forms.orgName" : "forms.fullName")}
              {...register("fullName", {
                value: fullName?.trim(),
                validate: value =>
                  value.trim().length >= 2 ||
                  t("forms.errEmptyAndMinLength").toString(),
                required: t(
                  isOrg ? "forms.errOrgNameRequired" : "forms.errNameRequired"
                ).toString()
              })}
              className="w-100"
              defaultValue={fullName}
              error={errors.fullName?.message}
            />
          </Row>
          <Row>
            <Input
              as="textarea"
              {...register("aboutYou")}
              style={{ height: "10rem" }}
              className="mt-3"
              label={t("forms.aboutYou")}
              defaultValue={about}
            />
          </Row>
          <Row xs="auto" className="mt-2">
            <Col>
              <TooltipButton
                text={t("forms.aboutYouTip")}
                tooltip={t("tooltipText")}
                variant="link"
              />
            </Col>
          </Row>
          {isOrg && (
            <SelectOrgCategory
              t={t}
              register={register}
              category={category}
              setCategory={setCategory}
            />
          )}

          <div className="mb-3">
            <h4 className="mb-3 mt-5">{t("socialLinks.socialMedia")}</h4>
            <div className={`row`}>
              <SocialInput
                label={t("socialLinks.twitter")}
                defaultValue={social?.twitter}
                className="col-sm-12 col-md-6 mb-1"
                iconSrc="/twitter.svg"
                {...register("twitter")}
              />
              <SocialInput
                label={t("socialLinks.linkedIn")}
                defaultValue={social?.linkedIn}
                className="col-sm-12 col-md-6 mb-1"
                iconSrc="/linkedin.svg"
                {...register("linkedIn")}
              />
              <SocialInput
                label={t("socialLinks.blueSky")}
                defaultValue={social?.blueSky}
                className="col-sm-12 col-md-6 mb-1"
                iconSrc="/bluesky.svg"
                {...register("blueSky")}
              />
              <SocialInput
                label={t("socialLinks.mastodon")}
                defaultValue={social?.mastodon}
                className="col-sm-12 col-md-6 mb-1"
                iconSrc="/mastodon.svg"
                {...register("mastodon")}
              />
              {isOrg && (
                <>
                  <SocialInput
                    label={t("socialLinks.instagram")}
                    defaultValue={social?.instagram}
                    className="col-sm-12 col-md-6 mb-1"
                    iconSrc="./instagram.svg"
                    {...register("instagram")}
                  />
                  <SocialInput
                    label={t("socialLinks.facebook")}
                    defaultValue={social?.fb}
                    className="col-sm-12 col-md-6"
                    iconSrc="./facebook.svg"
                    {...register("fb")}
                  />
                  <SocialInput
                    label={t("socialLinks.bluesky")}
                    defaultValue={social?.blueSky}
                    className="col-sm-12 col-md-6 mb-1"
                    iconSrc="./bluesky.svg"
                    {...register("blueSky")}
                  />
                  <SocialInput
                    label={t("socialLinks.mastodon")}
                    defaultValue={social?.mastodon}
                    className="col-sm-12 col-md-6 mb-1"
                    iconSrc="./mastodon.svg"
                    {...register("mastodon")}
                  />
                </>
              )}
            </div>
            {isOrg && (
              <>
                <h4 className="mb-3 mt-5">{t("contact.contactInfo")}</h4>
                <Row>
                  <Input
                    label={t("contact.email")}
                    defaultValue={contactInfo?.publicEmail}
                    {...register("publicEmail")}
                  />
                </Row>
                <Row className="mt-3">
                  <Input
                    label={t("contact.phone")}
                    defaultValue={contactInfo?.publicPhone}
                    {...register("publicPhone", {
                      minLength: {
                        value: 10,
                        message: t("contact.phoneLenWarning1")
                      },
                      maxLength: {
                        value: 10,
                        message: t("contact.phoneLenWarning2")
                      },
                      validate: () => {
                        const phoneNum = getValues("publicPhone")
                        return isNaN(phoneNum)
                          ? t("contact.phoneNumWarning").toString()
                          : undefined
                      }
                    })}
                    error={errors.publicPhone?.message}
                  />
                </Row>
                <Row className="mt-3">
                  <Input
                    label={t("contact.website")}
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
          <h2>{t("legislator.yourLegislators")}</h2>
          <YourLegislators />
        </TitledSectionCard>
      )}

      <Row>
        <Col>
          <Button className={`mt-2 mb-3 w-100 rounded-1`} type="submit">
            {t("saveChanges")}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

function SelectOrgCategory({ t, register, category, setCategory }: any) {
  return (
    <Form.Group className="mt-3" controlId="orgCategory">
      <Form.FloatingLabel label={t("forms.selectOrgCategory")}>
        <Form.Select
          as="select"
          value={category}
          {...register("orgCategory", {
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
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
  )
}

const SocialInput = styled(Input)`
  label {
    display: inline-block !important;
  }
`
