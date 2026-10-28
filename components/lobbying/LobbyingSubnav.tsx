import React from "react"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { Container } from "components/bootstrap"
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
      {/* The beta note: a slim pale orange note asking for feedback. */}
      <SlimBanner>
        {t("banner.feedback")}{" "}
        <a href="mailto:info@mapletestimony.org">info@mapletestimony.org</a>
      </SlimBanner>
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

const barStyle: React.CSSProperties = {
  background: "#fff",
  borderBottom: `1px solid ${MAPLE_COLORS.borderDefault}`,
  width: "100%"
}

/** No room under the row, so the tabs reach the bar's bottom edge (their
 * underline sits on its border, linkStyle). The label lines up with the tabs'
 * text rather than their boxes. */
const innerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "1.75rem",
  padding: "0.7rem 0 0",
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
  // The text in the middle of the bar: 0.7rem above it (innerStyle) and 0.7rem
  // below it to the bar's border, of which the underline's top 1.5px is part.
  paddingBottom: "calc(0.7rem - 1.5px)",
  borderBottom: `3px solid ${active ? MAPLE_COLORS.primary : "transparent"}`,
  // Down 1.5px, so the 3px underline is centred on the middle of the bar's
  // 1px border, half inside the bar and half outside. On a layer of its own
  // so what follows the bar does not paint over the part outside.
  marginBottom: -1.5,
  position: "relative",
  zIndex: 1,
  display: "inline-block",
  transition: "color 0.1s, border-color 0.1s"
})
