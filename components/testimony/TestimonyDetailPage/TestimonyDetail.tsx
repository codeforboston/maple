import { Position } from "components/db"
import { ViewAttachment } from "components/ViewAttachment"
import dynamic from "next/dynamic"
import { FC, ImgHTMLAttributes } from "react"
import styled from "styled-components"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"

const TestimonyContent = dynamic(
  () => import("./TestimonyContent").then(m => m.TestimonyContent),
  { ssr: false }
)

const Container = styled.div`
  font-family: "Nunito";
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
`

const Testimony = styled(props => {
  const { revision, authorNickname } = useCurrentTestimonyDetails()

  return (
    <div {...props}>
      <div className="fs-4">What {authorNickname} says</div>
      <TestimonyContent {...revision} />
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
  ImgHTMLAttributes<HTMLImageElement> & { position: Position }
> = ({ position, ...props }) => {
  const { action, ...positionProps } = positionInfo[position]
  return <img {...props} {...positionProps} />
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

  return (
    <div {...props}>
      <PositionIcon className="positionIcon" position={position} />
      <div className="author ms-2 me-auto">
        <div className="fs-4">
          {authorInfo} {positionInfo[position].action} this policy
        </div>
        <div>{revision.publishedAt.toDate().toLocaleDateString()}</div>
      </div>
      {isEdited && <div className="edited">Edited</div>}
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
    // TODO
    background: blue;
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

export const TestimonyDetail: FC = () => {
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
