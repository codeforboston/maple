import styled from "styled-components"
import { Col, Image } from "../../bootstrap"
import styles from "./BasicsOfTestimonyCard.module.css"

export type BasicsOfTestimonyCardProps = {
  title: string
  index: number
  alt: string
  paragraph: string
  src: string
}

// TODO: Consider moving outside this into a CommonComponents class
// TODO: Check for overlap between component styles between the seconds
//       of Learn Testimony. They're all just a bit different, but we can 
//       likely reduce boilerplate here.
const StyledCard = styled.div`
  width: 100%;
  height: auto;
  padding: 2rem 3rem;
  flex-direction: row;
  flex-wrap: wrap;
  display: flex;
  margin: 3rem 0;
  @media (max-width: 48em) {
    margin: 0;
    padding: 0;
  }
`

const StyledImageCol = styled(Col)`
  width: 20rem;
  display: flex;
  align-items: center;
  @media (max-width: 48em) {
    width: 50%;
    margin: 0 25%;
    transform: translate(0, 2rem);
  }
`

const StyledTitle = styled.div`
  font-family: "Nunito";
  font-size: 1.5rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -0.63px;
  text-align: left;
  color: #000;
  margin-bottom: 1rem;
  @media (max-width: 36em) {
    font-size: 1.25rem;
  }
`

const StyledContent = styled.div`
  flex-grow: 0;
  font-family: "Nunito";
  font-size: 1.5rem;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -0.63px;
  text-align: left;
  color: #000;
  @media (max-width: 36em) {
    font-size: 1.125rem;
  }
`

const BasicsOfTestimonyCard = ({ title, index, alt, paragraph, src }: BasicsOfTestimonyCardProps) => {
  return (
    <StyledCard>
      <StyledImageCol
        md={6}
        lg={{ order: index % 2 == 0 ? 0 : 5 }}
      >
        <Image
          fluid
          className={index % 2 == 0 ? styles.imageLeft : styles.imageRight}
          src={src}
          alt={alt}
        />
      </StyledImageCol>
      <Col
        className={index % 2 == 0 ? styles.textRight : styles.textLeft}
        lg={{ order: 3 }}
      >
        <StyledTitle>{title}</StyledTitle>
        <StyledContent>{paragraph}</StyledContent>
      </Col>
    </StyledCard>
  )
}

export default BasicsOfTestimonyCard
