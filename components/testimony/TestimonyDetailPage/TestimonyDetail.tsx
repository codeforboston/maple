import { Position } from "components/db"
import { ViewAttachment } from "components/ViewAttachment"
import { FC, ImgHTMLAttributes } from "react"
import styled from "styled-components"
import { useTestimonyDetails } from "./testimonyDetailSlice"

const Container = styled.div`
  white-space: pre-wrap;
  font-family: "Nunito";
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
`

const Testimony = styled(props => {
  const { testimony, author } = useTestimonyDetails()
  const authorNickname = author?.displayName ?? testimony.authorDisplayName

  return (
    <div {...props}>
      <div className="fs-4">What {authorNickname} says</div>
      <div>{testimony.content}</div>
    </div>
  )
})`
  white-space: pre-wrap;
`

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
  const { testimony, author } = useTestimonyDetails(),
    position = testimony.position,
    isEdited = testimony.version > 0

  const authorTitle = author ? (
    <a href={`/profile?id=${author.uid}`}>{author.fullName}</a>
  ) : (
    testimony.authorDisplayName
  )

  return (
    <div {...props}>
      <PositionIcon className="positionIcon" position={position} />
      <div className="author ms-2 me-auto">
        <div className="fs-4">
          {authorTitle} {positionInfo[position].action} this policy
        </div>
        <div>{testimony.publishedAt.toDate().toLocaleDateString()}</div>
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
  const { testimony } = useTestimonyDetails()

  return (
    <Container>
      <Header />
      <Separator />
      <Testimony />
      <div className="mt-2">
        <ViewAttachment testimony={testimony} />
      </div>
    </Container>
  )
}
