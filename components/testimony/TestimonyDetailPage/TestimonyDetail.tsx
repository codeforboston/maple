import { Position } from "components/db"
import { ViewAttachment } from "components/ViewAttachment"
import { FC, ImgHTMLAttributes } from "react"
import styled from "styled-components"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { TestimonyContent } from "../TestimonyContent"
import { useFlags } from "components/featureFlags"
import { useTranslation } from "next-i18next"

const Container = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
`

const Testimony = styled(props => {
  const { revision, authorTitle } = useCurrentTestimonyDetails()
  const { testimonyDiffing } = useFlags()
  const previous = testimonyDiffing ? revision.previous?.content : undefined

  const { t } = useTranslation("testimony")

  return (
    <div {...props}>
      <div className="fs-4">
        {t("testimonyDetail.what")} {authorTitle} {t("testimonyDetail.says")}
      </div>
      <TestimonyContent testimony={revision.content} previous={previous} />
    </div>
  )
})``

export const positionInfo = {
  neutral: {
    action: "is neutral on",
    src: "/thumbs-neutral.svg",
    alt: "Neutral"
  },
  endorse: { action: "endorses", src: "/thumbs-endorse.svg", alt: "Endorse" },
  oppose: { action: "opposes", src: "/thumbs-oppose.svg", alt: "Oppose" }
}

const PositionIcon: FC<
  React.PropsWithChildren<
    ImgHTMLAttributes<HTMLImageElement> & { position: Position }
  >
> = ({ position, ...props }) => {
  const { action, ...positionProps } = positionInfo[position]
  return <img aria-label={action} {...props} {...positionProps} />
}

const Header = styled(props => {
  const { revision, authorLink, authorTitle, isEdited } =
      useCurrentTestimonyDetails(),
    position = revision.position

  const authorInfo = authorLink ? (
    <a href={authorLink}>{authorTitle}</a>
  ) : (
    authorTitle
  )

  const { t } = useTranslation("testimony")

  return (
    <div {...props}>
      <PositionIcon className="positionIcon" position={position} />
      <div className="author ms-2 me-auto">
        <div className="fs-4">
          {authorInfo} {positionInfo[position].action}{" "}
          {t("testimonyDetail.thisPolicy")}
        </div>
        <div>{revision.publishedAt.toDate().toLocaleDateString()}</div>
      </div>
      {isEdited && <div className="edited">{t("testimonyDetail.edited")}</div>}
    </div>
  )
})`
  display: flex;
  align-items: center;

  .positionIcon {
    width: 2rem;
    height: 2rem;
  }

  .edited {
    background: var(--bs-blue);
    border-radius: 1rem;
    padding: 0 0.5rem;
    color: white;
    align-self: flex-end;
  }
`

const Separator = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  background: black;
  height: 1px;
`

export const TestimonyDetail: FC<React.PropsWithChildren<unknown>> = () => {
  const { revision } = useCurrentTestimonyDetails()

  return (
    <Container>
      <Header />
      <Separator />
      <Testimony />
      <div className="mt-2">
        <ViewAttachment testimony={revision} />
      </div>
    </Container>
  )
}
