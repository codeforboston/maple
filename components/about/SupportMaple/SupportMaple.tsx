import { ReactNode } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import AboutPagesCard from "../../AboutPagesCard/AboutPagesCard"
import { ArrowRightIcon } from "../../learn/icons"
import { Internal } from "../../links"
import LearnBreadcrumb from "../../learn/LearnBreadcrumb"
import LearnHeader from "../../learn/LearnHeader"
import LearnLayout from "../../learn/LearnLayout"

const DONATE_URL = "https://partnersindemocracy.us/?form=FUNMSSLLQEC"
const GITHUB_URL = "https://github.com/codeforboston/maple/graphs/contributors"
const FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScU0l0bs-QLdVqIlh6iwi-Y2kOrSv7eqH5h4klhhtNGqsxCSw/viewform?usp=sharing"
const BUG_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSebZTHz0XGR4WgPf10yTPXSOuZK2P41HxK0AFGXM57KbFWuDg/viewform?usp=share_link"

/* An external link inside body copy. */
const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

type Section = {
  key: string
  desc: ReactNode
  cta: { label: string; href: string }
}

/* eslint-disable i18next/no-literal-string -- not localised yet */
const SECTIONS: Section[] = [
  {
    key: "useMAPLE",
    desc: "The best way to support MAPLE is by using our platform and sharing it with friends and colleagues. That is the best endorsement we could receive.",
    cta: { label: "Start exploring", href: "/bills" }
  },
  {
    key: "donate",
    desc: "MAPLE is an initiative of Partners in Democracy - Education, a 501(c)(3) non profit organization. You can donate directly to the development of MAPLE.",
    cta: { label: "Donate now", href: DONATE_URL }
  },
  {
    key: "volunteer",
    desc: (
      <>
        MAPLE is volunteer-powered. Over{" "}
        <Ext href={GITHUB_URL}>one hundred</Ext> developers, designers, and
        researchers have contributed to MAPLE. If you'd like to get involved,
        reach out.
      </>
    ),
    cta: { label: "Contact us", href: "mailto:admin@mapletestimony.org" }
  },
  {
    key: "feedback",
    desc: (
      <>
        If you would like to share thoughts on your experience using MAPLE or
        suggest improvements, we'd love to hear from you. You can also{" "}
        <Ext href={BUG_URL}>report any bugs</Ext> you encounter.
      </>
    ),
    cta: { label: "Submit feedback", href: FEEDBACK_URL }
  }
]
/* eslint-enable i18next/no-literal-string */

/* Offset pill-header card body: the description with a ghost CTA (bold text +
   trailing arrow) pinned bottom-right. */
const PillBody = styled.div`
  display: flex;
  flex-direction: column;

  .desc {
    color: var(--maple-text-muted);
    line-height: 1.6;
    margin: 0;
  }

  .desc a {
    color: var(--bs-blue);
    text-decoration: underline;
  }

  .cta {
    display: inline-flex;
    align-self: flex-end;
    align-items: center;
    gap: 0.375rem;
    margin-top: auto;
    padding-top: 1.25rem;
    color: var(--bs-blue);
    font-weight: 700;
    font-size: 0.9375rem;
    text-decoration: none;

    svg {
      transition: transform 0.15s ease;
    }

    &:hover svg {
      transform: translateX(0.25rem);
    }
  }
`

const Cta = ({ label, href }: { label: string; href: string }) => {
  const arrow = <ArrowRightIcon sx={{ fontSize: "1.125rem" }} />
  if (href.startsWith("/")) {
    return (
      <Internal href={href} className="cta">
        {label}
        {arrow}
      </Internal>
    )
  }
  // Only http(s) links open in a new tab; mailto opens the mail client in place.
  const newTab = href.startsWith("http")
  return (
    <a
      href={href}
      className="cta"
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
      {arrow}
    </a>
  )
}

const SupportMaple = () => {
  const { t } = useTranslation(["supportmaple", "common"])

  return (
    <LearnLayout width="medium">
      <LearnBreadcrumb section={t("breadcrumb")} eyebrow={t("common:about")} />
      <LearnHeader
        title={t("title")}
        subhead={t("subhead")}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />
      {SECTIONS.map(({ key, desc, cta }) => (
        <AboutPagesCard key={key} title={t(`${key}.header`)}>
          <PillBody>
            <p className="desc">{desc}</p>
            <Cta {...cta} />
          </PillBody>
        </AboutPagesCard>
      ))}
    </LearnLayout>
  )
}

export default SupportMaple
