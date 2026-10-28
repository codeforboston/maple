import React from "react"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { Container } from "components/bootstrap"
import { DigitalDemocracyOnly, MapleOnly } from "components/shared/SkinOnly"
import { SlimBanner } from "components/shared/StyledSharedComponents"
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
      {/* Maple: main's slim beta bar. */}
      <MapleOnly>
        <div style={bannerStyle}>
          <Container>
            <div style={bannerInnerStyle}>
              <span style={betaPillStyle}>{t("banner.beta")}</span>
              <span>
                {t("banner.feedback")}{" "}
                <a
                  href="mailto:info@mapletestimony.org"
                  style={bannerLinkStyle}
                >
                  info@mapletestimony.org
                </a>
              </span>
            </div>
          </Container>
        </div>
      </MapleOnly>
      {/* Digital Democracy and Mixed: a slim pale orange note instead, with
          the same copy. */}
      <DigitalDemocracyOnly>
        <SlimBanner>
          {t("banner.feedback")}{" "}
          <a href="mailto:info@mapletestimony.org">info@mapletestimony.org</a>
        </SlimBanner>
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

const bannerStyle: React.CSSProperties = {
  background: MAPLE_COLORS.accent,
  color: "#fff",
  width: "100%"
}

const bannerInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "0.5rem 0.625rem",
  padding: "0.5rem 0",
  fontSize: 15,
  fontWeight: 600,
  textAlign: "center"
}

const betaPillStyle: React.CSSProperties = {
  background: "#fff",
  color: "#c25e00",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "0.125rem 0.5rem",
  borderRadius: 999,
  lineHeight: 1.4
}

const bannerLinkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "underline",
  textUnderlineOffset: 3
}

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
