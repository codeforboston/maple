import { useLayoutEffect, useRef } from "react"
import styled from "styled-components"
import { ConferenceByline } from "./ConferenceByline"
import { ConferenceCommittee } from "./ConferenceCommittee"
import { ConferenceHero } from "./ConferenceHero"
import { ConferencePicker } from "./ConferencePicker"
import { ConferenceRail } from "./ConferenceRail"
import { ConferenceTabs } from "./ConferenceTabs"
import { ConferenceText } from "./ConferenceText"
import { useConferenceTop, usePinnedNavbar } from "./hooks"
import { PageColumn, Title } from "./styles"
import { conferenceName, ConferencePageProps } from "./types"

/** The mockup's column, widened to 1320 once the rail sits beside it. */
const Page = styled(PageColumn)`
  display: flex;
  gap: 1.5rem;
  scroll-snap-align: start;
  scroll-snap-stop: always;

  @media (min-width: 992px) {
    max-width: 1320px;
    gap: 3.5rem;
  }
`

/** The header and the sections under it. */
const Main = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

/** Below md the picker shows the name, so the heading is there for screen
 * readers alone. */
const PageTitle = styled(Title)`
  @media (max-width: 767.98px) {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
`

/** A band that holds at the top while the sections scroll under it, run out
 * to the page's gutters so what passes behind it is covered. */
const Band = styled.div<{ $top: string; $z: number }>`
  position: sticky;
  top: ${({ $top }) => $top};
  z-index: ${({ $z }) => $z};
  margin: 0 -1.25rem;
  padding: 0 1.25rem;
  background: var(--maple-surface-page);

  @media (min-width: 576px) {
    margin: 0 -2rem;
    padding: 0 2rem;
  }
`

const TitleBand = styled(Band)`
  padding-top: 1.625rem;
  padding-bottom: 0.75rem;
`

/** A section the tabs lead to, parked under the title and the tabs: 4.5rem is
 * ConferenceTabs' row and the mockup's 24px under it. */
const Section = styled.div`
  margin-top: 1.5rem;
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--title-h, 5rem) + 4.5rem
  );
`

/** In the mockup's order, which goes on to the sections still to come. */
const SECTIONS = ["committee", "text"] as const

/**
 * One conference: who is deciding, and the two texts they are deciding
 * between, under a hero on what a conference committee is. The list of every
 * conference runs down the left from md up; below that the title opens it.
 * The landing alone opens on the hero (`openOnHero`).
 */
export function ConferenceDetails({
  conference,
  conferences,
  conferees,
  hearings,
  openOnHero = false
}: ConferencePageProps & { openOnHero?: boolean }) {
  const { top, hero, toConference } = useConferenceTop(openOnHero)
  // The tabs hold under the title, so they need its height.
  const main = useRef<HTMLDivElement>(null)
  const band = useRef<HTMLDivElement>(null)
  usePinnedNavbar(main)
  useLayoutEffect(() => {
    const el = band.current
    if (!el) return
    const read = () =>
      main.current?.style.setProperty("--title-h", `${el.offsetHeight}px`)
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <>
      <ConferenceHero ref={hero} onSee={toConference} landing={openOnHero} />
      <Page ref={top}>
        <ConferenceRail
          className="d-none d-md-block"
          conferences={conferences}
          current={conference.id}
        />
        <Main ref={main}>
          <TitleBand ref={band} $top="var(--maple-navbar-height)" $z={14}>
            <div className="d-md-none">
              <ConferencePicker
                conferences={conferences}
                current={conference}
              />
            </div>
            <PageTitle as={openOnHero ? "h2" : "h1"}>
              {conferenceName(conference)}
            </PageTitle>
          </TitleBand>
          <ConferenceByline conference={conference} />
          <Band
            $top="calc(var(--maple-navbar-height) + var(--title-h, 5rem))"
            $z={13}
          >
            <ConferenceTabs sections={SECTIONS} />
          </Band>
          <Section id="committee">
            {/* Keyed so a pinned seat does not outlive its conference. */}
            <ConferenceCommittee
              key={conference.id}
              court={conference.court}
              conferees={conferees}
              hearings={hearings}
            />
          </Section>
          <Section id="text">
            {/* Keyed so a picked version does not outlive its conference. */}
            <ConferenceText key={conference.id} conference={conference} />
          </Section>
        </Main>
      </Page>
    </>
  )
}
