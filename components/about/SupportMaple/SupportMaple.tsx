import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"
import IosShareIcon from "@mui/icons-material/IosShare"
import { Trans, useTranslation } from "next-i18next"
import { ComponentType } from "react"
import styled from "styled-components"
import AboutPagesCard from "../../AboutPagesCard/AboutPagesCard"
import { FEEDBACK_URL } from "../../common"
import { ArrowRightIcon } from "../../learn/icons"
import { Internal } from "../../links"
import LearnBreadcrumb from "../../learn/LearnBreadcrumb"
import LearnHeader from "../../learn/LearnHeader"
import LearnLayout from "../../learn/LearnLayout"
import GiveBox from "./GiveBox"

const GITHUB_URL = "https://github.com/codeforboston/maple/graphs/contributors"
const VOLUNTEER_EMAIL = "mailto:admin@mapletestimony.org"

type OtherWay = {
  key: "useMAPLE" | "volunteer" | "feedback"
  Icon: ComponentType<{ "aria-hidden"?: boolean | "true" }>
  href: string
  /** A link inside the body copy, if it has one. */
  bodyLink?: string
}

const OTHER_WAYS: OtherWay[] = [
  { key: "useMAPLE", Icon: IosShareIcon, href: "/bills" },
  {
    key: "volunteer",
    Icon: GroupsOutlinedIcon,
    href: VOLUNTEER_EMAIL,
    bodyLink: GITHUB_URL
  },
  { key: "feedback", Icon: ChatBubbleOutlineIcon, href: FEEDBACK_URL }
]

/* The donate card's body: the case for giving beside the give box. */
const DonateBody = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem 3rem;

  @media (min-width: 48em) {
    padding: 1.5rem 1rem 0.5rem;
  }

  .case {
    flex: 1 1 20rem;
    min-width: 0;

    h3 {
      margin: 0 0 0.875rem;
      font-family: var(--maple-font-heading);
      font-weight: 700;
      font-size: 1.625rem;
      line-height: 1.25;
      color: var(--maple-brand-primary-strong);
    }

    p {
      margin: 0 0 0.875rem;
      line-height: 1.65;
      color: var(--maple-text-body);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`

const OtherWays = styled.section`
  h2 {
    margin: 0 0 1.5rem;
    font-family: var(--maple-font-heading);
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 1.2;
    color: var(--maple-brand-primary-strong);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1.5rem;
  }
`

const OtherWayCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.75rem;
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-card-edge);
  border-radius: 0.5rem;

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: var(--maple-radius-pill);
    background: color-mix(
      in srgb,
      var(--maple-brand-primary) 10%,
      var(--maple-surface-base)
    );
    color: var(--maple-brand-primary);
  }

  h3 {
    margin: 0.25rem 0 0;
    font-family: var(--maple-font-heading);
    font-weight: 700;
    font-size: 1.25rem;
    line-height: 1.3;
    color: var(--maple-text-strong);
  }

  p {
    flex-grow: 1;
    margin: 0;
    line-height: 1.6;
    color: var(--maple-text-body);

    a {
      color: var(--bs-blue);
      text-decoration: underline;
    }
  }

  .cta {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 0.375rem;
    color: var(--bs-blue);
    font-weight: 700;
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
      <LearnBreadcrumb
        section={t("breadcrumb")}
        eyebrow={t("common:about")}
        withoutHome
      />
      <LearnHeader
        title={t("title")}
        subhead={t("subhead")}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />

      <AboutPagesCard title={t("donate.header")}>
        <DonateBody>
          <div className="case">
            <h3>{t("donate.heading")}</h3>
            <p>{t("donate.case")}</p>
            <p>{t("donate.use")}</p>
          </div>
          <GiveBox />
        </DonateBody>
      </AboutPagesCard>

      <OtherWays
        aria-labelledby="other-ways-heading"
        className="mx-sm-5 mx-xs-3"
      >
        <h2 id="other-ways-heading">{t("otherWays")}</h2>
        <div className="cards">
          {OTHER_WAYS.map(({ key, Icon, href, bodyLink }) => (
            <OtherWayCard key={key}>
              <div className="icon">
                <Icon aria-hidden="true" />
              </div>
              <h3>{t(`${key}.header`)}</h3>
              <p>
                <Trans
                  t={t}
                  i18nKey={`${key}.body`}
                  components={
                    bodyLink
                      ? [
                          // eslint-disable-next-line jsx-a11y/anchor-has-content
                          <a
                            href={bodyLink}
                            key={key}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ]
                      : undefined
                  }
                />
              </p>
              <Cta label={t(`${key}.cta`)} href={href} />
            </OtherWayCard>
          ))}
        </div>
      </OtherWays>
    </LearnLayout>
  )
}

export default SupportMaple
