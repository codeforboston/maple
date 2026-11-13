import { useCallback, useEffect, useRef, useState } from "react"
import { Trans, useTranslation } from "next-i18next"
import styled, { css } from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { Internal, maple } from "../links"
import { ConferenceDrawer, ConferencePopover } from "./ConferencePicker"
import { useMatches, useRailHidden } from "./hooks"
import {
  PageColumn,
  PHONE_GUTTER,
  RAIL_HIDDEN,
  RAIL_SHOWN,
  SHEET
} from "./styles"
import { ConferenceSummary } from "./types"

const JOINT_RULES = "https://malegislature.gov/Laws/Rules/Joint"

/** Where the steps stack, one under another, rather than in a row: below
 * 992px. There they fold, the first open to begin with, and the two buttons
 * are pinned to the screen's foot. */
const STACKED = "(max-width: 991.98px)"
const MAPLE_PROCESS = "https://www.mapletestimony.org/learn/legislative-process"

/**
 * The Conference Committees page: what a conference committee is, and
 * buttons on to a conference and the explorer. At least the rest of the first
 * screen: the page's wrapper is that tall, less the beta note above this
 * (pages/conferences/index.tsx), and this fills what is left of it.
 */
const Section = styled(PageColumn)`
  flex: 1 0 auto;
  width: 100%;
  /* Doubled (&&) so it outranks PageColumn's own padding whichever of the
     two is written to the page last, as a live reload of styles.ts writes
     PageColumn's again. */
  && {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  display: flex;
  flex-direction: column;

  /* The title in Lexend, the page's h1, which would otherwise take
     Bootstrap's Nunito. */
  *:root & .title {
    font-family: var(--maple-font-heading);
  }

  /* Centred down the screen. Where the steps stack, at the top, as the
     folded steps leave it far shorter than the screen. Everything but the
     buttons sits in a 720px column centred across it; the buttons' bar runs
     the screen's width, the buttons in line with the column (.actions,
     below). */
  .block {
    margin: auto 0;

    @media ${STACKED} {
      width: 100%;
      margin: 0 0 auto;

      /* The full width up to 720px: the block is a flex column here
         (below), where auto sides alone would shrink each to its own
         content. */
      > :not(.actions) {
        width: 100%;
        max-width: 720px;
        margin-left: auto;
        margin-right: auto;
      }
    }
  }
  .title {
    margin: 0;
    font-weight: 700;
    font-size: 2rem;
    line-height: 1.15;
    color: var(--maple-brand-primary-strong);
    text-wrap: balance;

    @media (min-width: 800px) {
      font-size: 2.75rem;
    }
  }
  /* A step smaller where the title is (under 800px). */
  .lead {
    max-width: 720px;
    margin: 0.375rem 0 0;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--maple-text-strong);

    @media (min-width: 800px) {
      font-size: 1rem;
    }
  }
  /* In the conference byline's type (ConferenceByline.tsx): the body face,
     regular, muted, at its own small size. */
  .sources {
    margin: 1.5rem 0 0;
    font-family: var(--maple-font-body);
    font-weight: 400;
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
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem 1.5rem;
  }

  /* Where the steps stack, the two buttons are pinned to the foot of the
     screen while the hero is in it, the steps scrolling under them: at the
     hero's foot (the block filling it), and held at the window's while the
     hero runs on below. Across the screen's full width, on the page's own
     ground, the links in line with the column's right edge (720px). */
  @media ${STACKED} {
    && {
      padding-bottom: 0;
    }

    .block {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
    }
    /* The 2rem the buttons have above them elsewhere, kept as the least gap
       under the sources: the buttons' own margin is auto here, which comes to
       nothing once the steps fill the screen. */
    .sources {
      margin-bottom: 2rem;
    }
    .actions {
      /* The page column's side (PageColumn, styles.ts), which the bar runs
         out over to the screen's edge. */
      --gutter: ${PHONE_GUTTER};
      @media (min-width: 576px) {
        --gutter: 2rem;
      }

      position: sticky;
      bottom: 0;
      z-index: 1;
      margin: auto calc(-1 * var(--gutter)) 0;
      padding: 0.75rem calc(max(0px, (100% - 720px) / 2) + var(--gutter))
        calc(1.75rem + env(safe-area-inset-bottom, 0px));
      background: var(--bs-body-bg);
      border-top: 1px solid var(--maple-surface-border);
    }
  }
`

/** Down the page where five do not fit side by side, joined by a line so they
 * read as one sequence, each step's text able to fold under its title, the
 * first open to begin with. Side by side, every step's text shows. */
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
    /* Into the 1.5rem gap below, stopping 8px short of the next number. */
    bottom: -16px;
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
    font-size: 0.8125rem;
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
    font-size: 0.9375rem;
    /* Bold, so each step's title stands clear of the muted text under it. */
    font-weight: 700;
    line-height: 1.35;
    color: var(--maple-text-strong);
  }
  p {
    margin: 4px 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--maple-text-muted);
  }

  /* The title as the way to open its step: the whole line, with a chevron at
     its right that turns over once it is open. */
  .toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;

    /* Its tap reaches over the whole step, number and text too: stretched
       over the step (li, which places it), still the one button. */
    &::after {
      content: "";
      position: absolute;
      inset: 0;
    }
  }
  .chevron {
    flex: none;
    font-size: 0.75rem;
    color: var(--maple-text-muted);
    transition: transform 150ms ease;
  }
  li.open .chevron {
    transform: rotate(180deg);
  }

  /* Stacked, a little more room between the steps. The hero's column keeps
     them to the lead's 720px (Section, .block). Each title takes the line's
     whole width, so on a phone every chevron sits at the right edge. */
  @media (max-width: 991.98px) {
    ol {
      row-gap: 1.5rem;
    }
    .text {
      flex: 1 1 auto;
    }
  }

  /* Folded where they stack (STACKED, above), so the way on stays in view:
     a closed step's text is out of the page from the first paint, before
     the script knows the width (Step, below), and an open one's is clear of
     the chevron's column (0.75rem, and the toggle's 0.75rem gap before it),
     its right edge the title's. */
  @media ${STACKED} {
    p {
      padding-right: 1.5rem;
    }
    li:not(.open) p {
      display: none;
    }
  }
  @media (min-width: 992px) {
    .chevron {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
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

/* The way on to a conference, shaped as the homepage hero's buttons
   (primaryAction, components/homepage/Homepage.module.css), a step smaller:
   0.9375rem bold rather than 1rem, and squared (3px), as the site's inputs
   and panels, not a pill. A link where there is a conference to open
   (SeeLink), else a faded button that says why on hover (SeeNone). */
const seeStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 10.5rem;
  min-height: 2.55rem;
  padding: 0.55rem 1.3rem;
  border: 1px solid var(--maple-brand-primary);
  border-radius: 3px;
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  background: var(--maple-brand-primary);
  color: #fff;
  text-decoration: none;
  transition: background-color var(--maple-transition-fast),
    color var(--maple-transition-fast);

  /* No arrow on mobile, where a conference's page has no rail (RAIL_HIDDEN,
     styles.ts) and the button lists them instead (SeePick). */
  @media ${RAIL_HIDDEN} {
    .see-arrow {
      display: none;
    }
  }

  &:hover,
  &:focus-visible {
    background: var(--maple-brand-primary-strong);
    color: #fff;
  }
`

const SeeLink = styled(Internal)`
  ${seeStyle}
`

/** Straight to the first conference, from RAIL_FROM (styles.ts), where its
 * page has the rail beside it to move on by. */
const SeeFirst = styled(SeeLink)`
  @media ${RAIL_HIDDEN} {
    display: none;
  }
`

/** On mobile, where a conference's page has no rail, the same button,
 * without the arrow, opens the list of them to choose from rather than the
 * first: below 576px in a sheet rising from the screen's foot
 * (ConferenceDrawer, SHEET in styles.ts), wider in a popover over the button
 * (ConferencePopover). */
const SeePick = styled.button`
  ${seeStyle}
  cursor: pointer;

  @media ${RAIL_SHOWN} {
    display: none;
  }
`

/** Where no conference came back from the server: faded, and its title says
 * why. aria-disabled rather than disabled, so the title still shows on hover
 * (a disabled button doesn't take the pointer in every browser) and it can
 * still be focused to read it; it does nothing when pressed. */
const SeeNone = styled.button`
  ${seeStyle}
  opacity: 0.5;
  cursor: not-allowed;

  &:hover,
  &:focus-visible {
    background: var(--maple-brand-primary);
  }
`

/* A link beside the button rather than a second button, at the button's
   0.9375rem bold. */
const ExplorerLink = styled(Internal)`
  display: inline-flex;
  align-items: center;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--maple-brand-primary);
  text-decoration: underline;
  text-underline-offset: 0.16em;

  &:hover,
  &:focus-visible {
    color: var(--maple-brand-primary-strong);
  }
`

/**
 * What a conference committee is and the five steps it goes through, on the
 * Conference Committees page. `see` is the conference the button opens, or
 * null where the court has none yet, the button there but doing nothing; on
 * mobile the button lists `conferences` to choose from instead. The
 * explorer is reached from here too.
 */
export function ConferenceHero({
  see,
  conferences
}: {
  see: string | null
  /** Every conference, for the button to list on mobile; without them, it
   * opens `see` there too. */
  conferences?: ConferenceSummary[] | null
}) {
  const { t } = useTranslation("conferences")
  // Without the rail, the list of conferences the button opens (SeePick): a
  // sheet below 576px, added to the page the first time it is opened and
  // kept after, so it can slide away again; wider, a popover over the button.
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState(false)
  const sheet = useMatches(SHEET)
  const pickButton = useRef<HTMLButtonElement>(null)
  const stopPicking = useCallback(() => setPicking(false), [])
  const railHidden = useRailHidden()
  useEffect(() => {
    if (!railHidden) setPicking(false)
  }, [railHidden])
  const pick = see !== null && Boolean(conferences?.length)
  const steps = t("hero.steps", { returnObjects: true }) as {
    h: string
    p: string
  }[]
  // Which steps are open where they fold, wherever they stack (STACKED), the
  // first to begin with.
  const [open, setOpen] = useState<number[]>([0])
  const folds = useMatches(STACKED)
  return (
    <Section as="section">
      <div className="block">
        {/* Conference addresses have their own h1. */}
        <h1 className="title">{t("index_title")}</h1>
        <p className="lead">{t("hero.lead")}</p>
        <StepList>
          <ol>
            {steps.map((step, i) => (
              <li key={i} className={open.includes(i) ? "open" : undefined}>
                {i < steps.length - 1 && <span className="line" aria-hidden />}
                <span className="num">{i + 1}</span>
                <div className="text">
                  <h2>
                    {folds ? (
                      <button
                        type="button"
                        className="toggle"
                        aria-expanded={open.includes(i)}
                        aria-controls={`conference-step-${i}`}
                        onClick={() =>
                          setOpen(was =>
                            was.includes(i)
                              ? was.filter(x => x !== i)
                              : [...was, i]
                          )
                        }
                      >
                        {step.h}
                        <FontAwesomeIcon
                          className="chevron"
                          icon={faChevronDown}
                          aria-hidden
                        />
                      </button>
                    ) : (
                      step.h
                    )}
                  </h2>
                  <p id={`conference-step-${i}`}>{step.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </StepList>
        <p className="sources">
          <Trans
            t={t}
            i18nKey="hero.sources"
            // Plain links in a new tab: External puts a space inside the
            // link, which would sit before the full stop.
            components={{
              1: <a href={MAPLE_PROCESS} target="_blank" rel="noreferrer" />,
              3: <a href={JOINT_RULES} target="_blank" rel="noreferrer" />
            }}
          />
        </p>
        {/* The explorer as a link first, then the way on to a conference
            as the button, at the right. */}
        <div className="actions">
          <ExplorerLink href={maple.conferenceExplorer()}>
            {t("explorer")}
          </ExplorerLink>
          {see ? (
            <>
              {/* With the rail, straight to the first conference, the rail
                  beside it to move on by; without it, the list to choose
                  from. */}
              {pick && conferences ? (
                <>
                  <SeeFirst href={see}>
                    {t("hero.see")}
                    <FontAwesomeIcon
                      className="see-arrow"
                      icon={faArrowRight}
                      aria-hidden
                    />
                  </SeeFirst>
                  <SeePick
                    ref={pickButton}
                    type="button"
                    aria-expanded={picking}
                    onClick={() => {
                      if (sheet) setPicked(true)
                      setPicking(v => !v)
                    }}
                  >
                    {t("hero.see")}
                  </SeePick>
                  {picked && (
                    <ConferenceDrawer
                      conferences={conferences}
                      show={picking && sheet}
                      onHide={stopPicking}
                    />
                  )}
                  {picking && !sheet && (
                    <ConferencePopover
                      conferences={conferences}
                      anchor={pickButton}
                      onClose={stopPicking}
                      align="end"
                    />
                  )}
                </>
              ) : (
                <SeeLink href={see}>
                  {t("hero.see")}
                  <FontAwesomeIcon
                    className="see-arrow"
                    icon={faArrowRight}
                    aria-hidden
                  />
                </SeeLink>
              )}
            </>
          ) : (
            // Return to this: with no conference from the server, the button
            // used to send readers to the Conference Explorer instead. That
            // was removed because it caused confusion to be sent somewhere
            // other than what the button says. For now it is disabled and
            // says the committees didn't load. Ideally this would go to an
            // empty skeleton page with a message instead of disabling the
            // button.
            <SeeNone
              type="button"
              aria-disabled="true"
              title={t("hero.see_unavailable")}
            >
              {t("hero.see")}
              <FontAwesomeIcon
                className="see-arrow"
                icon={faArrowRight}
                aria-hidden
              />
            </SeeNone>
          )}
        </div>
      </div>
    </Section>
  )
}
