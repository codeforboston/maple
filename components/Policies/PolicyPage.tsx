import { PolicyContent } from "./PolicyContent"
import { Button, Stack, Container, Image, Row, Col } from "react-bootstrap"
import { ButtonHTMLAttributes, useEffect, useState } from "react"
import style from "./PolicyPage.module.css"
import Router from "next/router"
import classNames from "classnames"
import { useTranslation } from "next-i18next"

const policies = ["copyright", "privacy-policy", "code-of-conduct"] as const
export type Policy = (typeof policies)[number]

export default function PolicyPage({
  policy = "privacy-policy"
}: {
  policy?: Policy
}) {
  const { t } = useTranslation(["policies", "common"])
  const handleOnClick = (p: Policy) => {
    Router.push(`/policies/${p}`)
  }

  return (
    <Container fluid className={style.policyContent}>
      <h1>{t("common:titles.policies")}</h1>
      <Stack direction="horizontal">
        <Button
          className={`${
            style[policy === "privacy-policy" ? "currentTab" : "tab"]
          }`}
          id="privacy-policy"
          onClick={e => handleOnClick("privacy-policy")}
        >
          {t("policies:tabs.privacy.line1")} <br />{" "}
          {t("policies:tabs.privacy.line2")}
        </Button>
        <Button
          className={`${style[policy === "copyright" ? "currentTab" : "tab"]}`}
          id="copyright"
          onClick={e => handleOnClick("copyright")}
        >
          {t("policies:tabs.terms.line1")} <br />
        </Button>

        <Button
          className={`${
            style[policy === "code-of-conduct" ? "currentTab" : "tab"]
          }`}
          id="code-of-conduct"
          onClick={e => handleOnClick("code-of-conduct")}
        >
          {t("policies:tabs.conduct.line1")} <br />{" "}
          {t("policies:tabs.conduct.line2")}
        </Button>
      </Stack>

      <PolicyContent policy={policy} />

      <div className={style.sharedValues}>
        <p className={style.subHeading}>{t("policies:values.heading")}</p>
        <hr className={style.bottomBorder}></hr>
        <p className={style.text1}>{t("policies:values.description1")}</p>
        <p className={style.text2}>{t("policies:values.description2")}</p>
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
            <p className={style.values}>{t("policies:values.humility")}</p>
          </Col>
          <Col xs={12} className={style.blueBox}>
            <Image
              src="/compassion.png"
              alt=""
              className={style.symbol}
            ></Image>
            <p className={style.values}>{t("policies:values.compassion")}</p>
          </Col>
          <Col xs={12} className={style.blueBox}>
            <Image src="/lightBulb.png" alt="" className={style.symbol}></Image>
            <p className={style.values}>{t("policies:values.curiosity")}</p>
          </Col>
        </Row>
      </Container>
    </Container>
  )
}
