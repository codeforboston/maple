import { useTranslation } from "next-i18next"
import { Col, Row, Container } from "../bootstrap"
import { MemberItem, Divider, PageDescr } from "../shared/CommonComponents"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"

export const CoreTeam = () => {
  const { t } = useTranslation("our-team")

  return (
    <Container>
      <PageDescr className="py-3">{t("team.desc")}</PageDescr>
      <Row>
        <Col>
          <AboutPagesCard title={t("team.foundersTitle")}>
            <MemberItem
              name="Matthew Victor"
              role={t("team.roles.MVictor")}
              email="mvictor@mapletestimony.org"
              descr={t("team.MVictor")}
            />
            <Divider />
            <MemberItem
              name="Nathan Sanders"
              role={t("team.roles.NSanders")}
              email="nsanders@mapletestimony.org"
              descr={t("team.NSanders")}
            />
          </AboutPagesCard>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title={t("team.designEngineeringTitle")}>
            <MemberItem
              name="Matt King"
              role={t("team.roles.MKing")}
              descr={t("team.MKing")}
            />
            <Divider />
            <MemberItem name="Grace Kohut" role={t("team.roles.GKohut")} />
            <Divider />
            <MemberItem
              name="Janice Lichtman"
              role={t("team.roles.JLichtman")}
            />
            <Divider />
            <MemberItem name="Merritt Baggett" descr={t("team.MBaggett")} />
            <Divider />
            <MemberItem name="Minqi Chai" descr={t("team.MChai")} />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}
