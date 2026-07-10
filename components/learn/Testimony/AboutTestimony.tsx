import { useTranslation } from "next-i18next"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import LearnBreadcrumb from "../LearnBreadcrumb"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"
import { ChevronDownIcon, ChevronUpIcon } from "../icons"
import {
  HowBlob,
  WhatBlob,
  WhenBlob,
  WhereBlob,
  WhoBlob,
  WhyBlob
} from "../icons/Blobs"
import { WHY_ICONS } from "../icons/WhyItMattersIcons"

type CardData = { badge: string; headline: string; body: string }
type Matter = { title: string; body: string }
type StepData = {
  title: string
  body: string
  linkLabel?: string
  linkText?: string
  href?: string
}
type Tip = { label: string; body: string }

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

const TipsPanel = styled.div`
  border: 1px solid rgba(28, 43, 58, 0.12);
  border-radius: var(--maple-radius-lg);
  overflow: hidden;
  background-color: #fdfaf5;

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    text-align: left;
    background: none;
    border: 0;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--bs-blue);
      outline-offset: -2px;
    }
  }

  .toggle-label {
    font-weight: 600;
    color: #1c2b3a;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  .content {
    padding: 0 1rem 0.75rem;
  }

  .intro {
    color: var(--maple-text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
  }

  .tip {
    padding: 0.5rem 0;
  }

  .tip-label {
    font-weight: 600;
    color: #1c2b3a;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }

  .tip-body {
    color: var(--maple-text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0;
  }
`

const Panel = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;

  .head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1.5rem 1rem;
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

/* The HOW panel fades in as the reader reaches "Ready to get started?".
   It is only ever hidden once JS has mounted and confirmed the reader has not
   asked for reduced motion, so no-JS and reduced-motion visitors always see it
   immediately and screen readers never lose it. */
const Reveal = styled.div<{ $hidden: boolean }>`
  opacity: ${p => (p.$hidden ? 0 : 1)};
  transform: ${p => (p.$hidden ? "translateY(2rem)" : "none")};
  transition: opacity 0.85s ease-out, transform 0.85s ease-out;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`

const ReadyToStart = styled.p`
  font-weight: 700;
  color: #2f3031;
  font-size: 1.125rem;
  text-align: center;
  margin: 1.5rem 0;
`

const Tips = ({
  toggle,
  intro,
  tips
}: {
  toggle: string
  intro: string
  tips: Tip[]
}) => {
  const [open, setOpen] = useState(false)
  return (
    <TipsPanel>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="testimony-tips"
      >
        <span className="toggle-label">{toggle}</span>
        {open ? (
          <ChevronUpIcon
            aria-hidden="true"
            sx={{ fontSize: "1rem", color: "var(--maple-text-muted)" }}
          />
        ) : (
          <ChevronDownIcon
            aria-hidden="true"
            sx={{ fontSize: "1rem", color: "var(--maple-text-muted)" }}
          />
        )}
      </button>
      <div className="content" id="testimony-tips" hidden={!open}>
        <p className="intro">{intro}</p>
        {tips.map(tip => (
          <div className="tip" key={tip.label}>
            <p className="tip-label">{tip.label}</p>
            <p className="tip-body">{tip.body}</p>
          </div>
        ))}
      </div>
    </TipsPanel>
  )
}

const useRevealOnScroll = () => {
  const sentinelRef = useRef<HTMLParagraphElement>(null)
  // Starts visible: only enhanced once we know JS is running.
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (reduceMotion || typeof IntersectionObserver === "undefined") return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    // If the reader has already scrolled to the sentinel (deep link, refresh
    // mid-page), leave the section visible rather than hiding it to animate.
    const TRIGGER_POINT = 0.45 // sentinel must reach 45% up the viewport
    if (
      sentinel.getBoundingClientRect().top <
      window.innerHeight * TRIGGER_POINT
    )
      return

    setHidden(true)
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setHidden(false)
          observer.disconnect()
        }
      },
      // Negative bottom margin shrinks the observed area, so the reveal waits
      // until the sentinel has travelled well up the viewport.
      { rootMargin: "0px 0px -55% 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return { sentinelRef, hidden }
}

export const AboutTestimony = () => {
  const { t } = useTranslation("learn")
  const { sentinelRef, hidden } = useRevealOnScroll()

  const cards = t("testimony.cards", { returnObjects: true }) as CardData[]
  const matters = t("testimony.why.matters", {
    returnObjects: true
  }) as Matter[]
  const steps = t("testimony.how.steps", { returnObjects: true }) as StepData[]
  const tips = t("testimony.tips", { returnObjects: true }) as Tip[]

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
                  <Badge />
                  <h2>{card.headline}</h2>
                </div>
                <p className="body">{card.body}</p>
              </Card>
            </div>
          )
        })}
      </div>

      {/* WHY */}
      <Panel className="mb-3">
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
            const Icon = WHY_ICONS[i]
            return (
              <MatterRow key={item.title}>
                <Icon />
                <div>
                  <p className="title">{item.title}</p>
                  <p className="text">{item.body}</p>
                </div>
              </MatterRow>
            )
          })}
        </div>
      </Panel>

      <ReadyToStart ref={sentinelRef}>
        {t("testimony.readyToStart")}
      </ReadyToStart>

      {/* HOW */}
      <Reveal $hidden={hidden}>
        <Panel>
          <div className="head">
            <HowBlob />
            <h2>{t("testimony.how.headline")}</h2>
          </div>
          <div className="body">
            <p className="lede mb-4">{t("testimony.how.intro")}</p>

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

                  {i === 0 && (
                    <Tips
                      toggle={t("testimony.tipsToggle")}
                      intro={t("testimony.tipsIntro")}
                      tips={tips}
                    />
                  )}
                </div>
              </Step>
            ))}
          </div>
        </Panel>
      </Reveal>
    </LearnLayout>
  )
}

export default AboutTestimony
