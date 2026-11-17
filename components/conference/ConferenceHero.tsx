import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { External, Internal, maple } from "../links"
import { PageColumn } from "./styles"
import { ConferenceLanding } from "./types"

const JOINT_RULES = "https://malegislature.gov/Laws/Rules/Joint"
const MAPLE_PROCESS = "https://www.mapletestimony.org/learn/legislative-process"

/** A screen under the navbar, with the block centred down it. */
const Section = styled(PageColumn)`
  min-height: calc(100lvh - var(--maple-navbar-height));
  padding-top: 2rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;

  .block {
    margin: auto 0;
  }
  .title {
    margin: 0;
    font-weight: 700;
    font-size: 2.25rem;
    line-height: 1.15;
    color: var(--maple-brand-primary-strong);
    text-wrap: balance;

    @media (min-width: 800px) {
      font-size: 3rem;
    }
  }
  .lead {
    max-width: 720px;
    margin: 0.375rem 0 0;
    font-size: 1.125rem;
    line-height: 1.55;
    color: var(--maple-text-strong);
  }
  .sources {
    margin: 1.5rem 0 0;
    font-size: 0.75rem;
    line-height: 1.6;
    color: var(--maple-text-muted);

    a {
      color: inherit;
      text-decoration: underline dotted;
      text-underline-offset: 3px;
    }
  }
  .actions {
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.5rem;
  }
`

/** Down the page where five do not fit side by side, joined by a line so they
 * read as one sequence. */
const StepList = styled.div`
  margin-top: 2.25rem;

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    row-gap: 1.25rem;
  }
  li {
    position: relative;
    display: flex;
    gap: 0.875rem;
  }
  .line {
    position: absolute;
    left: 15px;
    top: 40px;
    bottom: -12px;
    width: 2px;
    background: var(--maple-surface-border);
  }
  .num {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--maple-brand-primary);
    color: #fff;
  }
  .text {
    min-width: 0;
    padding-top: 5px;
  }
  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--maple-text-strong);
  }
  p {
    margin: 4px 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--maple-text-muted);
  }

  @media (min-width: 992px) {
    ol {
      grid-template-columns: repeat(5, 1fr);
      column-gap: 1.5rem;
    }
    li {
      flex-direction: column;
      gap: 0.75rem;
    }
    .line {
      left: 40px;
      right: -16px;
      top: 15px;
      bottom: auto;
      width: auto;
      height: 2px;
    }
    .text {
      padding: 0 0.5rem 0 0;
    }
  }
`

const SeeLink = styled(Internal)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.125rem;
  border: 0;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--maple-brand-primary);
  color: #fff;
  text-decoration: none;

  &:hover {
    background: var(--maple-brand-primary-strong);
    color: #fff;
  }
`

const ExplorerLink = styled(Internal)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
`

/**
 * What a conference committee is and the five steps it goes through: the
 * Conference Committees page. It leads on to a conference (`landing`, where
 * the court has one) and to the explorer.
 */
export function ConferenceHero({
  landing
}: {
  landing: ConferenceLanding | null
}) {
  const { t } = useTranslation("conferences")
  const steps = t("hero.steps", { returnObjects: true }) as {
    h: string
    p: string
  }[]
  return (
    <Section as="section">
      <div className="block">
        <h1 className="title">{t("index_title")}</h1>
        <p className="lead">{t("hero.lead")}</p>
        <StepList>
          <ol>
            {steps.map((step, i) => (
              <li key={i}>
                {i < steps.length - 1 && <span className="line" aria-hidden />}
                <span className="num">{i + 1}</span>
                <div className="text">
                  <h2>{step.h}</h2>
                  <p>{step.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </StepList>
        <p className="sources">
          <Trans
            t={t}
            i18nKey="hero.sources"
            components={{
              1: <External href={MAPLE_PROCESS} />,
              3: <External href={JOINT_RULES} />
            }}
          />
        </p>
        <div className="actions">
          {landing && (
            <SeeLink href={maple.conference(landing)}>
              {t("hero.see")}
              <FontAwesomeIcon icon={faArrowRight} aria-hidden />
            </SeeLink>
          )}
          <ExplorerLink href={maple.conferenceExplorer()}>
            {t("explorer")}
            <FontAwesomeIcon icon={faArrowRight} aria-hidden />
          </ExplorerLink>
        </div>
      </div>
    </Section>
  )
}
