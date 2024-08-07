import { ImageButton } from "components/buttons"
import { ImageProps } from "react-bootstrap"
import styled from "styled-components"
import clsx from "clsx"
import { useTranslation } from "next-i18next"

export const ArchiveTestimonyButton = (props: ImageProps) => {
  const { t } = useTranslation("testimony")
  return (
    <ImageButton
      alt={t("deleteTestimony")}
      tooltip="Delete Testimony"
      src="/delete-testimony.svg"
      className={"testimony-button"}
      {...props}
    />
  )
}
