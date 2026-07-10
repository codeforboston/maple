import { useTranslation } from "next-i18next"
import styled from "styled-components"
import LearnBreadcrumb from "../LearnBreadcrumb"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"
import { CheckIcon, MegaphoneIcon, ScaleIcon, UsersIcon } from "../icons"
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
      "changeNorms",
      "signUp"
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  @media (max-width: 48rem) {
    grid-template-columns: 1fr;
  }
`

const PersonaCard = styled.button<{ $color: string; $active: boolean }>`
  border-radius: var(--maple-radius-lg);
  padding: 0.875rem 1rem;
  text-align: left;
  border: 2px solid ${p => (p.$active ? p.$color : "transparent")};
  background-color: ${p =>
    p.$active ? p.$color : "var(--maple-surface-base)"};
  box-shadow: var(--maple-shadow-sm);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  .glyph {
    display: block;
    margin-bottom: 0.25rem;
    color: ${p => (p.$active ? "#fff" : "var(--bs-gray-400, #9ca3af)")};
  }

  .label {
    font-weight: 700;
    font-size: 0.8125rem;
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
  padding: 1.5rem 1.75rem;
  background-color: ${p => alpha(p.$color, 5)};

  .tagline {
    font-family: var(--maple-font-heading);
    font-weight: 900;
    font-size: 1.25rem;
    line-height: 1.3;
    color: ${p => p.$color};
    margin-bottom: 0.5rem;
  }

  .why {
    color: var(--maple-text-body);
    font-size: 0.9375rem;
    line-height: 1.6;
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.125rem 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 48rem) {
      grid-template-columns: 1fr;
    }
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
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

  .feature {
    color: var(--maple-text-body);
    font-size: 1rem;
    line-height: 1.55;
  }

  @media (max-width: 36rem) {
    padding: 1.25rem;
  }
`

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
          return (
            <PersonaCard
              key={persona.slug}
              type="button"
              role="tab"
              id={`persona-${persona.slug}`}
              aria-selected={isActive}
              aria-controls="persona-panel"
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
              <p className="label">{t(`${persona.ns}:title`)}</p>
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
            {active.benefits.map(key => (
              <li key={key}>
                <span
                  className="tick"
                  aria-hidden="true"
                  style={{ backgroundColor: active.color }}
                >
                  <CheckIcon sx={{ fontSize: "0.9375rem", color: "#fff" }} />
                </span>
                <span className="feature">
                  {t(`${active.ns}:benefits.${key}.title`)}
                </span>
              </li>
            ))}
          </ul>
        </Offer>
      </Detail>
    </LearnLayout>
  )
}

export default WhyUseMaple
