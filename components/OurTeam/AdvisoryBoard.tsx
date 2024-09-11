import { useTranslation } from "next-i18next"
import { Col, Row, Container } from "../bootstrap"
import {
  MemberItem,
  PageTitle,
  PageDescr,
  SectionContainer,
  Divider
} from "../shared/CommonComponents"

export const AdvisoryBoard = () => {
  const { t } = useTranslation("our-team")

  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>{t("advisory.title")}</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>{t("advisory.desc")}</PageDescr>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer className="py-1">
            <MemberItem
              name="John Griffin"
              descr="John Griffin is the Managing Partner for Strategy at Partners in Democracy. He has spent a decade working in Massachusetts policy and politics, including as Massachusetts Policy Director at Democrats for Education Reform. John holds a Master in Public Policy degree from the Harvard Kennedy School."
            />
            <Divider />
            <MemberItem name="Marci Harris" descr={t("advisory.MHarris")} />
            <Divider />
            <MemberItem
              name="David Fields"
              descr="David Fields, Ph.D., is Professor of the Practice within the Graduate School of Education at Northeastern University and Senior Fellow with The Burnes Center for Social Change. He brings over 20 years of higher education experience building, launching, and scaling industry aligned programs. At the Burnes Center, his work includes supporting AI for Impact, and its InnovateMA co-op program in partnership with the Commonwealth of Massachusetts."
            />
            <Divider />
            <MemberItem name="Matt Prewitt" descr={t("advisory.MPrewitt")} />
            <Divider />
            <MemberItem name="James Turk" descr={t("advisory.JTurk")} />
            <Divider />
            <MemberItem name="Harlan Weber" descr={t("advisory.HWeber")} />
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}
