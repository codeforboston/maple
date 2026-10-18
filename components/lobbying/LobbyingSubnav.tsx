import React from "react"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { Container } from "components/bootstrap"
import styled from "styled-components"
import { Banner } from "components/shared/StyledSharedComponents"
import { DigitalDemocracyOnly, MapleOnly } from "components/shared/SkinOnly"
import { MAPLE_COLORS } from "./chartTheme"

export function LobbyingSubnav() {
  const { t } = useTranslation("lobbying")
  const { pathname } = useRouter()

  const LINKS = [
    { label: t("subnav.overview"), href: "/lobbying", exact: true },
    { label: t("sections.bills"), href: "/lobbying/bills" },
    { label: t("sections.clients"), href: "/lobbying/clients" },
    { label: t("sections.firms"), href: "/lobbying/firms" }
  ]

  return (
    <>
      <MapleOnly>
        <Banner>
          {t("banner.betaLine1")}{" "}
          <a href="mailto:info@mapletestimony.org" style={{ color: "#fff" }}>
            info@mapletestimony.org
          </a>{" "}
          {t("banner.betaLine2")}
        </Banner>
      </MapleOnly>
      {/* Digital Democracy and Mixed: a slim orange note in place of the large
          orange banner. */}
      <DigitalDemocracyOnly>
        <BetaNote>
          {t("banner.betaLine1")}{" "}
          <a href="mailto:info@mapletestimony.org">info@mapletestimony.org</a>{" "}
          {t("banner.betaLine2")}
        </BetaNote>
      </DigitalDemocracyOnly>
      <div style={barStyle}>
        <Container>
          <div style={innerStyle}>
            <span style={titleStyle}>{t("subnav.label")}</span>
            <nav style={{ display: "flex", gap: "1.25rem" }}>
              {LINKS.map(({ label, href, exact }) => {
                const active = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(href + "/")
                return (
                  <a key={href} href={href} style={linkStyle(active)}>
                    {label}
                  </a>
                )
              })}
            </nav>
          </div>
        </Container>
      </div>
    </>
  )
}

const BetaNote = styled.p`
  margin: 0;
  padding: 1.1rem 1rem;
  text-align: center;
  font-size: 0.9375rem;
  line-height: 1.45;
  /* A pale tint of the Beta tag's orange, with the amber note's dark ink. */
  color: var(--maple-color-amber-subtle-text);
  background: color-mix(in srgb, var(--bs-orange) 14%, #ffffff);
  border-bottom: 1px solid color-mix(in srgb, var(--bs-orange) 45%, #ffffff);

  a {
    color: var(--maple-color-amber-subtle-text);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 0.16em;
  }
`

const barStyle: React.CSSProperties = {
  background: "#fff",
  borderBottom: `1px solid ${MAPLE_COLORS.borderDefault}`,
  width: "100%"
}

const innerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.75rem",
  padding: "0.5rem 0",
  flexWrap: "wrap"
}

const titleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: MAPLE_COLORS.textMuted,
  whiteSpace: "nowrap"
}

const linkStyle = (active: boolean): React.CSSProperties => ({
  color: active ? MAPLE_COLORS.primary : MAPLE_COLORS.textBody,
  fontWeight: active ? 600 : 400,
  textDecoration: "none",
  fontSize: 14,
  paddingBottom: "0.4rem",
  borderBottom: `2px solid ${active ? MAPLE_COLORS.primary : "transparent"}`,
  display: "inline-block",
  transition: "color 0.1s, border-color 0.1s"
})
