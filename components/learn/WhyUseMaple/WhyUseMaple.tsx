import { TFunction, useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { Internal } from "../../links"
import LearnBreadcrumb from "../LearnBreadcrumb"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"
import {
  CheckIcon,
  ChevronDownIcon,
  MegaphoneIcon,
  ScaleIcon,
  UsersIcon
} from "../icons"
import { GREEN, NAVY, ORANGE, alpha } from "../palette"

/**
 * "Who Uses MAPLE" from the Figma prototype: three persona cards above a tinted
 * hero and a two-column "What we offer" checklist.
 *
 * The copy is maple's own. The prototype's `personas` array was derived from
 * these namespaces — its taglines are `callToAction.title`, its "why" text is
 * `callToAction.bodytext`, and its feature bullets are the `benefits.*.title`
 * values — so nothing here is newly written.
 *
 * Routing is unchanged: each persona keeps its own URL under /why-use-maple.
 */

export type Persona = {
  slug: string
  ns: string
  color: string
  Icon: typeof UsersIcon
  benefits: string[]
  /** callToAction body keys, in render order. */
  body: string[]
}

export const PERSONAS: Persona[] = [
  {
    slug: "for-individuals",
    ns: "forindividuals",
    color: NAVY,
    Icon: UsersIcon,
    benefits: [
      "youMatter",
      "multipleSides",
      "trustedOrgs",
      "anyLanguage",
      "stayInformed"
    ],
    body: ["bodytext"]
  },
  {
    slug: "for-orgs",
    ns: "fororgs",
    color: GREEN,
    Icon: MegaphoneIcon,
    benefits: [
      "reach",
      "connect",
      "language",
      "coordinate",
      "seeEveryone",
      "curateHistory",
      "legislativeResearch",
      "changeNorms"
    ],
    body: ["bodytext"]
  },
  {
    slug: "for-legislators",
    ns: "forlegislators",
    color: ORANGE,
    Icon: ScaleIcon,
    benefits: [
      "constituents",
      "seeTestimony",
      "simplifyTestimony",
      "languageAccess",
      "advancedStatistics"
    ],
    body: ["bodytextOne", "bodytextTwo"]
  }
]

const PersonaGrid = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`

const PersonaCard = styled.button<{ $color: string; $active: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  border-radius: var(--maple-radius-lg);
  padding: 0.875rem 1rem;
  text-align: left;
  border: 2px solid ${p => (p.$active ? p.$color : "transparent")};
  background-color: ${p =>
    p.$active ? p.$color : "var(--maple-surface-base)"};
  box-shadow: var(--maple-shadow-sm);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, flex 0.2s ease;

  .glyph {
    flex-shrink: 0;
    color: ${p => (p.$active ? "#fff" : "var(--bs-gray-400, #9ca3af)")};
  }

  .label {
    font-weight: 700;
    font-size: 0.8125rem;
    line-height: 1.2;
    margin: 0;
    color: ${p => (p.$active ? "#fff" : "#374151")};
  }

  &:hover {
    border-color: ${p => p.$color};
  }

  &:focus-visible {
    outline: 2px solid var(--bs-blue);
    outline-offset: 3px;
  }

  /* All three keep their short label on one row. Center and tighten a little
     on narrow screens so "Organizations" still fits. */
  @media (max-width: 40rem) {
    align-items: center;
    text-align: center;
    padding: 0.75rem 0.5rem;

    .label {
      font-size: 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Detail = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;
`

const Hero = styled.div<{ $color: string }>`
  padding: 2rem;
  background-color: ${p => alpha(p.$color, 5)};

  .tagline {
    font-family: var(--maple-font-heading);
    font-weight: 900;
    font-size: 1.5rem;
    line-height: 1.25;
    color: ${p => p.$color};
    margin-bottom: 0.75rem;
  }

  .why {
    color: var(--maple-text-body);
    font-size: 1.0625rem;
    line-height: 1.65;
    margin-bottom: 0;
  }

  .why + .why {
    margin-top: 0.75rem;
  }

  @media (max-width: 36rem) {
    padding: 1.25rem;
  }
`

const Offer = styled.div`
  padding: 2.25rem 2rem 2.5rem;

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    color: var(--maple-text-strong);
    font-size: 1.375rem;
    margin-bottom: 1.5rem;
  }

  ul {
    /* One full-width column: each benefit is its own disclosure. */
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    border: 1px solid var(--maple-surface-border);
    border-radius: var(--maple-radius-lg);
    overflow: hidden;
  }

  .benefit-toggle {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--maple-surface-muted);
    }

    &:focus-visible {
      outline: 2px solid var(--bs-blue);
      outline-offset: -2px;
    }
  }

  .tick {
    flex-shrink: 0;
    margin-top: 0.125rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--maple-radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feature-title {
    flex: 1;
    min-width: 0;
    font-weight: 700;
    color: var(--maple-text-strong);
    line-height: 1.4;
  }

  .chevron {
    flex-shrink: 0;
    color: var(--maple-text-muted);
    transition: transform 0.25s ease;
  }

  .benefit-toggle[aria-expanded="true"] .chevron {
    transform: rotate(180deg);
  }

  /* Height transition without measuring the content; delayed visibility keeps
     a closed body out of the accessibility tree and the focus order. */
  .benefit-body {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    visibility: hidden;
    transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.2s ease, visibility 0s linear 0.35s;
  }

  .benefit-body[data-open="true"] {
    grid-template-rows: 1fr;
    opacity: 1;
    visibility: visible;
    transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.25s ease 0.08s, visibility 0s;
  }

  .benefit-body > div {
    min-height: 0;
    overflow: hidden;
  }

  .benefit-body p {
    color: var(--maple-text-muted);
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0;
    padding: 0 1.25rem 1.25rem 3.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .benefit-body,
    .benefit-body[data-open="true"],
    .chevron {
      transition: none;
    }
  }

  /* Print the whole page: every benefit expanded, no toggles. */
  @media print {
    .benefit-body {
      display: block;
      grid-template-rows: none;
      opacity: 1;
      visibility: visible;
      transition: none;
    }

    .benefit-body > div {
      overflow: visible;
    }

    .chevron {
      display: none;
    }

    .benefit-toggle {
      cursor: auto;
    }
  }

  @media (max-width: 36rem) {
    padding: 1.25rem;
  }
`

/**
 * Supporting copy for a benefit. Most read a single `bodytext`; `fororgs`'s
 * legislativeResearch is stored as bodytext1 + a link + bodytext2, so it is
 * reassembled with an internal link to the bill search.
 */
const BenefitBody = ({
  ns,
  benefitKey,
  t
}: {
  ns: string
  benefitKey: string
  t: TFunction
}) => {
  const base = `${ns}:benefits.${benefitKey}`
  const body = t(`${base}.bodytext`, { defaultValue: "" })
  if (body) return <>{body}</>

  const before = t(`${base}.bodytext1`, { defaultValue: "" })
  const linkText = t(`${base}.linkText`, { defaultValue: "" })
  const after = t(`${base}.bodytext2`, { defaultValue: "" })
  if (!before && !linkText && !after) return null

  return (
    <>
      {before} <Internal href="/bills">{linkText}</Internal> {after}
    </>
  )
}

export const WhyUseMaple = ({
  slug,
  onSelect
}: {
  slug: string
  onSelect: (slug: string) => void
}) => {
  const { t } = useTranslation([
    "learn",
    "forindividuals",
    "fororgs",
    "forlegislators"
  ])

  const active = PERSONAS.find(p => p.slug === slug) ?? PERSONAS[0]

  // One benefit open at a time. Keyed by persona so switching tabs starts fresh
  // rather than leaving a stale key from the previous persona's list.
  const [openBenefit, setOpenBenefit] = useState<string | null>(null)
  useEffect(() => {
    setOpenBenefit(null)
  }, [active])

  return (
    <LearnLayout width="wide">
      <LearnBreadcrumb section={t("learn:whyUseMaple.breadcrumb")} />
      <LearnHeader
        title={t("learn:whyUseMaple.title")}
        subhead={t("learn:whyUseMaple.subhead")}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />

      <PersonaGrid role="tablist" aria-orientation="horizontal">
        {PERSONAS.map(persona => {
          const isActive = persona.slug === active.slug
          const label = t(`${persona.ns}:title`)
          const tabLabel = t(`${persona.ns}:tabLabel`)
          return (
            <PersonaCard
              key={persona.slug}
              type="button"
              role="tab"
              id={`persona-${persona.slug}`}
              aria-selected={isActive}
              aria-controls="persona-panel"
              aria-label={label}
              title={label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(persona.slug)}
              $color={persona.color}
              $active={isActive}
            >
              <persona.Icon
                aria-hidden="true"
                className="glyph"
                sx={{ fontSize: "1.5rem" }}
              />
              <p className="label" aria-hidden="true">
                {tabLabel}
              </p>
            </PersonaCard>
          )
        })}
      </PersonaGrid>

      <Detail
        role="tabpanel"
        id="persona-panel"
        aria-labelledby={`persona-${active.slug}`}
      >
        <Hero $color={active.color}>
          <p className="tagline">{t(`${active.ns}:callToAction.title`)}</p>
          {active.body.map(key => (
            <p className="why" key={key}>
              {t(`${active.ns}:callToAction.${key}`)}
            </p>
          ))}
        </Hero>

        <Offer>
          <h2>{t(`${active.ns}:benefits.header`)}</h2>
          <ul>
            {active.benefits.map(key => {
              const open = openBenefit === key
              return (
                <li key={key}>
                  <button
                    type="button"
                    className="benefit-toggle"
                    id={`benefit-${key}`}
                    aria-expanded={open}
                    aria-controls={`benefit-panel-${key}`}
                    onClick={() => setOpenBenefit(open ? null : key)}
                  >
                    <span
                      className="tick"
                      aria-hidden="true"
                      style={{ backgroundColor: active.color }}
                    >
                      <CheckIcon
                        sx={{ fontSize: "0.9375rem", color: "#fff" }}
                      />
                    </span>
                    <span className="feature-title">
                      {t(`${active.ns}:benefits.${key}.title`)}
                    </span>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="chevron"
                      sx={{ fontSize: "1.25rem" }}
                    />
                  </button>
                  <div
                    className="benefit-body"
                    id={`benefit-panel-${key}`}
                    role="region"
                    aria-labelledby={`benefit-${key}`}
                    data-open={open ? "true" : "false"}
                  >
                    <div>
                      <p>
                        <BenefitBody ns={active.ns} benefitKey={key} t={t} />
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </Offer>
      </Detail>
    </LearnLayout>
  )
}

export default WhyUseMaple
