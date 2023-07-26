import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { useAuth } from "../auth"
import { Image, Spinner } from "../bootstrap"
import { useProfile } from "../db"
import { useTranslation } from "next-i18next"

export type ImageInputProps = {
  className?: string
}

export const ImageInput = ({ className }: ImageInputProps) => {
  const { user } = useAuth()
  const uid = user?.uid
  const { updatingProfileImage, updateProfileImage, profile } = useProfile()

  const profileImage = profile?.profileImage

  const onChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files !== null) {
        const file = files[0]
        await updateProfileImage(file)
      }
    },
    [updateProfileImage]
  )
  const { t } = useTranslation("profile")

  return (
    <div className="d-flex flex-row px-3 col">
      <Image
        className={className}
        style={{
          objectFit: "contain",
          height: "10rem",
          width: "10rem",
          borderRadius: "2rem",
          margin: "1rem"
        }}
        alt="Profile image"
        src={profileImage}
      ></Image>
      {updatingProfileImage && <Spinner animation="border" />}
      <div className="d-flex flex-column justify-content-center align-items-start col mx-3">
        <h5>{t("content.uploadOrgImg")}</h5>
        <input
          id="profileimage"
          className={`bg-white d-block`}
          type="file"
          accept="image/png, image/jpg"
          onChange={onChange}
        />
      </div>
    </div>
  )
}
