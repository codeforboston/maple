import { useTranslation } from "next-i18next"
import { usePublishedTestimonyAttachment } from "./db"
import { External } from "./links"
import styled from "styled-components"
import { Testimony } from "common/testimony/types"

const StyledExternal = styled(External)`
  text-decoration: none;
`

export function ViewAttachment({ testimony }: { testimony?: Testimony }) {
  {
    const id = testimony?.attachmentId
    return id ? <Open id={id} /> : null
  }
}

const Open = ({ id }: { id: string }) => {
  const { t } = useTranslation("testimony")

  const url = usePublishedTestimonyAttachment(id)
  return url ? (
    <StyledExternal href={url}>{t("viewAttached")}</StyledExternal>
  ) : null
}
