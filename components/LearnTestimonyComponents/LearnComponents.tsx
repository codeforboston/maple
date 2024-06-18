import { Container, Card, Row, Col } from "../bootstrap"
import RoleOfTestimonyCard from "./RoleOfTestimony/RoleOfTestimonyCard"
import BasicsOfTestimonyCard from "./BasicsOfTestimony/BasicsOfTestimonyCard"
import { TestimonyCardList } from "./TestimonyCardComponents"
import styled from "styled-components"
import {
  WritingContent,
  OralContent,
  WriteOrCallContent
} from "components/CommunicatingWithLegislators/CommunicatingWithLegislatorsContent"
import { useTranslation } from "next-i18next"

const StyledContainer = styled(Container)`
  p {
    letter-spacing: -0.625px;
  }
`

const StyledCardBody = styled(Card.Body)`
  letter-spacing: -0.625px;
  line-height: 2.05rem;
`

const Basics = () => {
  const { t } = useTranslation("learnComponents")
  interface BasicsContentItem {
    title: string
    paragraph: string
    src: string
    alt: string
  }
  const basicsContent = t("basics.content", {
    returnObjects: true
  }) as BasicsContentItem[]
  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">{t("basics.title")}</h1>
      <p className="fs-4 tracking-tight lh-base">{t("basics.intro")}</p>
      {basicsContent.map((value, index) => (
        <BasicsOfTestimonyCard
          title={value.title}
          index={index}
          key={value.title}
          alt={value.alt}
          paragraph={value.paragraph}
          src={`/${value.src}`}
        />
      ))}
    </Container>
  )
}

const Role = () => {
  const { t } = useTranslation("learnComponents")
  interface RoleContentItem {
    title: string
    paragraph: string
    src: string
    alt: string
  }
  const roleContent = t("role.content", {
    returnObjects: true
  }) as unknown as RoleContentItem[]

  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">{t("role.title")}</h1>
      <p className="fs-4 tracking-tight lh-base">{t("role.intro")}</p>
      {roleContent.map((value, index) => (
        <RoleOfTestimonyCard
          title={value.title}
          index={index}
          key={value.title}
          alt={value.alt}
          paragraph={value.paragraph}
          src={`/${value.src}`}
        />
      ))}
    </Container>
  )
}

const Write = () => {
  interface WriteContentItem {
    title: string
    paragraphs: string[]
    src: string
    alt: string
  }
  const { t } = useTranslation("learnComponents")
  const writeContent = t("write.content", {
    returnObjects: true
  }) as unknown as WriteContentItem[]

  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">{t("write.title")}</h1>
      <p className="fs-4 tracking-tight lh-base">{t("write.intro")}</p>
      <TestimonyCardList contents={writeContent} shouldAlternateImages={true} />
    </Container>
  )
}

const CommunicatingWithLegislators = () => {
  const { t } = useTranslation("learnComponents")

  const CommWithLegCard = ({
    title,
    children
  }: {
    title: string
    children: JSX.Element
  }): JSX.Element => {
    return (
      <Card className={"my-5 mx-2 rounded-3 bg-white pb-4 pb-lg-5"}>
        <Card.Title as="h2" className={"mx-auto mt-4 fs-1"}>
          {title}
        </Card.Title>
        <StyledCardBody className="px-sm-4 mx-sm-4 p-lg-0 m-lg-0 fs-4">
          {children}
        </StyledCardBody>
      </Card>
    )
  }

  return (
    <StyledContainer>
      <Row className={"mb-5"}>
        <Col fluid="m" lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
          <h1 className={"fw-bold text-center display-4 mt-5 mx-n4"}>
            {t("communicating.title")}
          </h1>
          <p className={"ms-1 fs-4"}>{t("communicating.intro")}</p>

          <CommWithLegCard title={t("communicating.testifyInWriting")}>
            <WritingContent />
          </CommWithLegCard>

          <CommWithLegCard title={t("communicating.testifyOrally")}>
            <OralContent />
          </CommWithLegCard>

          <CommWithLegCard title={t("communicating.writeOrCall")}>
            <WriteOrCallContent />
          </CommWithLegCard>
        </Col>
      </Row>
    </StyledContainer>
  )
}

export { Basics, Role, Write, CommunicatingWithLegislators }
