import React from "react"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { Container } from "components/bootstrap"
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
  )
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
