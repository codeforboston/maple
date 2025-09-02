import { PolicyContent } from "./PolicyContent"
import { Button, Stack, Container, Image, Row, Col } from "react-bootstrap"
import style from "./PolicyPage.module.css"
import Router from "next/router"
import classNames from "classnames"
import { useTranslation } from "next-i18next"

const policies = ["privacy-policy", "copyright", "code-of-conduct"] as const
export type Policy = (typeof policies)[number]

export default function PolicyPage({
  policy = "privacy-policy"
}: {
  policy?: Policy
}) {
  const { t } = useTranslation("policies")
  return (
    <Container fluid className={style.policyContent}>
      <h1>{t("title")}</h1>
      <Stack direction="horizontal">
        {policies.map(p => (
          <Button
            className={`${style[policy === p ? "currentTab" : "tab"]}`}
            id={p}
            onClick={() => Router.push(`/policies/${p}`)}
          >
            {t(`tabs.${p}`)}
          </Button>
        ))}
      </Stack>

      <PolicyContent policy={policy} />

      <div className={style.sharedValues}>
        <p className={style.subHeading}>{t("values.heading")}</p>
        <hr className={style.bottomBorder}></hr>
        <p className={style.text1}>{t("values.description")}</p>
        <p className={style.text2}>{t("values.description2")}</p>
      </div>

      <Container fluid>
        <Row
          className={classNames(
            style.boxContainer,
            "row-fluid",
            "gx-5",
            "gy-3"
          )}
        >
          <Col xs={12} className={style.blueBox}>
            <Image src="/handShake.jpg" alt="" className={style.symbol}></Image>
            <p className={style.values}>{t("values.humility")}</p>
          </Col>
          <Col xs={12} className={style.blueBox}>
            <Image
              src="/compassion.png"
              alt=""
              className={style.symbol}
            ></Image>
            <p className={style.values}>{t("values.compassion")}</p>
          </Col>
          <Col xs={12} className={style.blueBox}>
            <Image src="/lightBulb.png" alt="" className={style.symbol}></Image>
            <p className={style.values}>{t("values.curiosity")}</p>
          </Col>
        </Row>
      </Container>
    </Container>
  )
}
