import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { Internal } from "../../links"
import LearnBreadcrumb from "../LearnBreadcrumb"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"
import {
  HowBlob,
  WhatBlob,
  WhenBlob,
  WhereBlob,
  WhoBlob,
  WhyBlob
} from "../icons/Blobs"
import { WHY_ICONS } from "../icons/WhyItMattersIcons"

/**
 * Anchors for two of the Learn pages that were folded into this one. The old
 * slugs are kept verbatim as ids so /learn/<slug> can redirect straight to the
 * section that replaced it (see the redirects in next.config.js) and so links
 * from outside the site keep their meaning.
 *
 * writing-effective-testimony is not here: it is a page again, not a section.
 */
export const ANCHORS = {
  role: "role-of-testimony",
  communicating: "communicating-with-legislators"
} as const

type CardData = { badge: string; headline: string; body: string }
type Matter = { title: string; body: string }
type StepData = {
  title: string
  body: string
  linkLabel?: string
  linkText?: string
  href?: string
}

const BADGES: Record<string, () => JSX.Element> = {
  who: WhoBlob,
  what: WhatBlob,
  when: WhenBlob,
  where: WhereBlob
}

const Card = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;
  height: 100%;

  .head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1.5rem 1rem;

    /* The badge is a flex item beside the headline: let it shrink and a long
       headline squeezes it below its drawn size. */
    > svg {
      flex-shrink: 0;
    }
  }

  h2 {
    font-weight: 700;
    color: var(--maple-text-strong);
    font-size: 1rem;
    line-height: 1.2;
    margin: 0;
  }

  .body {
    padding: 0 1.5rem 1.5rem;
    color: var(--maple-text-muted);
    line-height: 1.45;
    margin: 0;
  }
`

const MatterRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.125rem 1.5rem;
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-lg);

  & + & {
    margin-top: 0.5rem;
  }

  /* Without this the icon is a shrinkable flex item: on a narrow screen the
     text squeezes it well below its 40px and it reads as a different size in
     every row. */
  > svg {
    flex-shrink: 0;
  }

  .title {
    font-weight: 600;
    color: #1c2b3a;
    line-height: 1.5;
    margin: 0 0 0.25rem;
  }

  .text {
    color: var(--maple-text-muted);
    line-height: 1.45;
    margin: 0;
  }
`

const NumBadge = styled.span`
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--maple-radius-pill);
  background: var(--maple-surface-learn);
  border: 1px solid #cccfdd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--maple-font-heading);
  font-size: 1rem;
  line-height: 1;
  color: #000;
`

/* Holds the numbered steps, so they can be inset from the panel without moving
   the HOW heading or the intro line above them. */
const Steps = styled.div`
  padding: 0.5rem 1.5rem 0;

  @media (max-width: 36rem) {
    padding: 0.5rem 0 0;
  }
`

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  .title {
    font-weight: 600;
    color: #1c2b3a;
    line-height: 1.5;
    margin: 0 0 0.25rem;
  }

  .text {
    color: var(--maple-text-muted);
    line-height: 1.45;
    margin: 0 0 0.75rem;
  }

  a {
    color: var(--bs-blue);
    text-decoration: underline;
  }
`

const Panel = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;

  /* Deep-link targets: stop short of the sticky navbar rather than under it. */
  &#${ANCHORS.role}, &#${ANCHORS.communicating} {
    scroll-margin-top: calc(var(--maple-navbar-height) + 1rem);
  }

  .head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1.5rem 1rem;

    /* The blob is a flex item beside the headline: let it shrink and a long
       headline squeezes it below its drawn size. */
    > svg {
      flex-shrink: 0;
    }
  }

  h2 {
    font-weight: 700;
    color: var(--maple-text-strong);
    font-size: 1rem;
    line-height: 1.2;
    margin: 0;
  }

  .body {
    padding: 0 1.5rem 1.5rem;
  }

  .lede {
    color: var(--maple-text-muted);
    line-height: 1.45;
  }
`

const ReadyToStart = styled.p`
  font-weight: 700;
  color: #2f3031;
  font-size: 1.125rem;
  text-align: center;
  margin: 1.5rem 0;
`

export const AboutTestimony = () => {
  const { t } = useTranslation("learn")

  const cards = t("testimony.cards", { returnObjects: true }) as CardData[]
  const matters = t("testimony.why.matters", {
    returnObjects: true
  }) as Matter[]
  const steps = t("testimony.how.steps", { returnObjects: true }) as StepData[]

  return (
    <LearnLayout width="medium">
      <LearnBreadcrumb section={t("testimony.breadcrumb")} />
      <LearnHeader
        title={t("testimony.title")}
        subhead={t("testimony.subhead")}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />

      {/* WHO / WHAT / WHEN / WHERE */}
      <div className="row g-3 mb-3">
        {cards.map(card => {
          const Badge = BADGES[card.badge]
          return (
            <div className="col-12 col-md-6" key={card.badge}>
              <Card>
                <div className="head">
                  {Badge && <Badge />}
                  <h2>{card.headline}</h2>
                </div>
                <p className="body">{card.body}</p>
              </Card>
            </div>
          )
        })}
      </div>

      {/* WHY */}
      <Panel className="mb-3" id={ANCHORS.role}>
        <div className="head">
          <WhyBlob />
          <h2>{t("testimony.why.headline")}</h2>
        </div>
        <div className="body">
          <p className="lede mb-4">{t("testimony.why.body")}</p>
          <p
            className="fw-bold mb-3"
            style={{ color: "var(--maple-text-strong)" }}
          >
            {t("testimony.why.mattersHeading")}
          </p>
          {matters.map((item, i) => {
            // WHY_ICONS has one icon per matters entry; if copy adds an entry
            // beyond the drawn set, that row just goes without an icon rather
            // than rendering <undefined /> and crashing the page.
            const Icon = WHY_ICONS[i]
            return (
              <MatterRow key={item.title}>
                {Icon && <Icon />}
                <div>
                  <p className="title">{item.title}</p>
                  <p className="text">{item.body}</p>
                </div>
              </MatterRow>
            )
          })}
        </div>
      </Panel>

      <ReadyToStart>{t("testimony.readyToStart")}</ReadyToStart>

      {/* HOW */}
      <Panel id={ANCHORS.communicating}>
        <div className="head">
          <HowBlob />
          <h2>{t("testimony.how.headline")}</h2>
        </div>
        <div className="body">
          <p className="lede mb-4">{t("testimony.how.intro")}</p>

          <Steps>
            {steps.map((step, i) => (
              <Step key={step.title}>
                <NumBadge aria-hidden="true">{i + 1}</NumBadge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="title">{step.title}</p>
                  <p className="text">{step.body}</p>

                  {step.href && (
                    <p className="text">
                      {step.linkLabel}{" "}
                      <a href={step.href} target="_blank" rel="noreferrer">
                        {step.linkText}
                      </a>
                    </p>
                  )}

                  {/* The tips used to sit here as a collapsible panel; they are
                      their own page now. */}
                  {i === 0 && (
                    <p className="text">
                      <Trans
                        t={t}
                        i18nKey="testimony.tipsLink"
                        components={[
                          // eslint-disable-next-line react/jsx-key
                          <Internal href="/learn/writing-effective-testimony" />
                        ]}
                      />
                    </p>
                  )}
                </div>
              </Step>
            ))}
          </Steps>
        </div>
      </Panel>
    </LearnLayout>
  )
}

export default AboutTestimony
