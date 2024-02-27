import styled from "styled-components"
import { Col, Image } from "../../bootstrap"
import { TestimonyCard, TestimonyCardContent, TestimonyCardTitle } from "../StyledTestimonyComponents"

export type BasicsOfTestimonyCardProps = {
  title: string
  index: number
  alt: string
  paragraph: string
  src: string
}

const TestimonyWordBubble = styled(Col)`
  width: 20rem;
  display: flex;
  align-items: center;
  @media (max-width: 48em) {
    width: 50%;
    margin: 0 25%;
    transform: translate(0, 2rem);
  }
`
const WordBubbleImage = ({alignLeft, className, src, alt} : {alignLeft: boolean, className?: string, src: string, alt: string}) => {
  return (
    <Image className={className} fluid src={src} alt={alt} />
  )
}
const StyledWordBubbleImage = styled(WordBubbleImage)`
  transform: ${props => props.alignLeft ? 'translate(2rem)' : 'translate(-2rem)'}
`

const TestimonyTextCol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
  background: #ffffff;
  border-radius: 12px;
`

const BasicTestimonyCard = styled(TestimonyCard)`
  @media (max-width: 48em) {
    margin: 0;
    padding: 0;
  }
`

const BasicsOfTestimonyCard = ({ title, index, alt, paragraph, src }: BasicsOfTestimonyCardProps) => {
  return (
    <BasicTestimonyCard>
      <TestimonyWordBubble
        md={6}
        lg={{ order: index % 2 == 0 ? 0 : 5 }}
      >
        <StyledWordBubbleImage
          alignLeft={index % 2 == 0}
          alt={alt}
          src={src}
        />
      </TestimonyWordBubble>
      <TestimonyTextCol
        lg={{ order: 3 }}
      >
        <TestimonyCardTitle className={`mb-3`}>{title}</TestimonyCardTitle>
        <TestimonyCardContent>{paragraph}</TestimonyCardContent>
      </TestimonyTextCol>
    </BasicTestimonyCard>
  )
}

export default BasicsOfTestimonyCard
