import { useTranslation } from "next-i18next"
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

const StyledContainer = styled(Container)`
  p {
    letter-spacing: -0.625px;
  }
`

const StyledCardBody = styled(Card.Body)`
  letter-spacing: -0.625px;
  line-height: 2.05rem;
`

const BasicsSrcAlt = [
  {
    src: "who.svg",
    alt: "who.title"
  },
  {
    src: "what.svg",
    alt: "what.title"
  },
  {
    src: "when.svg",
    alt: "when.title"
  },
  {
    src: "where.svg",
    alt: "where.title"
  },
  {
    src: "why.svg",
    alt: "Why"
  }
]

const RoleSrcAlt = [
  {
    src: "speaker-with-thumbs.svg",
    alt: "Speaker with thumbs"
  },
  {
    src: "speaker-with-leg.svg",
    alt: "Speaker with documents"
  },
  {
    src: "speaker-with-pen.svg",
    alt: "Speaker with pen"
  }
]

const WriteSrcAlt = [
  {
    src: "leg-with-clock.svg",
    alt: ""
  },
  {
    src: "leg-with-lightbulb.svg",
    alt: ""
  },
  {
    src: "writing.svg",
    alt: ""
  },
  {
    src: "opinions.svg",
    alt: ""
  },
  {
    src: "respect-with-blob.svg",
    alt: ""
  }
]

const Basics = () => {
  const { t } = useTranslation("learnComponents")
  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">{t("basics.title")}</h1>
      <p className="fs-4 tracking-tight lh-base">{t("basics.intro")}</p>
      {BasicsSrcAlt.map((value, index) => (
        <BasicsOfTestimonyCard
          title={t(`basics.content.${index}.title`)}
          index={index}
          key={t(`basics.content.${index}.title`)}
          alt={value.alt}
          paragraph={t(`basics.content.${index}.paragraph`)}
          src={`/${value.src}`}
        />
      ))}
    </Container>
  )
}
const Role = () => {
  const { t } = useTranslation("learnComponents")
  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">{t("role.title")}</h1>
      <p className="fs-4 tracking-tight lh-base">{t("role.intro")}</p>
      {RoleSrcAlt.map((value, index) => (
        <RoleOfTestimonyCard
          title={t(`role.content.${index}.title`)}
          index={index}
          key={value.src}
          alt={value.alt}
          paragraph={t(`role.content.${index}.paragraph`)}
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
  }) as WriteContentItem[]

  const mergedContent = WriteSrcAlt.map((item, index) => ({
    ...item,
    ...writeContent[index]
  }))

  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">{t("write.title")}</h1>
      <p className="fs-4 tracking-tight lh-base">{t("write.intro")}</p>
      <TestimonyCardList
        contents={mergedContent}
        shouldAlternateImages={true}
      />
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

          <CommWithLegCard title={t("communicating.testifyInWriting.title")}>
            <WritingContent />
          </CommWithLegCard>

          <CommWithLegCard title={t("communicating.testifyOrally.title")}>
            <OralContent />
          </CommWithLegCard>

          <CommWithLegCard title={t("communicating.writeOrCall.title")}>
            <WriteOrCallContent />
          </CommWithLegCard>
        </Col>
      </Row>
    </StyledContainer>
  )
}

export { Basics, Role, Write, CommunicatingWithLegislators }
