import styled from "styled-components"
import { ConferenceByline } from "./ConferenceByline"
import { ConferenceCommittee } from "./ConferenceCommittee"
import { ConferenceHero } from "./ConferenceHero"
import { ConferencePicker } from "./ConferencePicker"
import { ConferenceRail } from "./ConferenceRail"
import { ConferenceText } from "./ConferenceText"
import { useConferenceTop } from "./hooks"
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

/** The header and the sections under it, a gap apart. */
const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
  flex: 1 1 auto;
  padding-top: 1.625rem;
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
  return (
    <>
      <ConferenceHero ref={hero} onSee={toConference} landing={openOnHero} />
      <Page ref={top}>
        <ConferenceRail
          className="d-none d-md-block"
          conferences={conferences}
          current={conference.id}
        />
        <Main>
          <header>
            <div className="d-md-none">
              <ConferencePicker
                conferences={conferences}
                current={conference}
              />
            </div>
            <PageTitle as={openOnHero ? "h2" : "h1"}>
              {conferenceName(conference)}
            </PageTitle>
            <ConferenceByline conference={conference} />
          </header>
          {/* Keyed so a pinned seat does not outlive its conference. */}
          <ConferenceCommittee
            key={conference.id}
            court={conference.court}
            conferees={conferees}
            hearings={hearings}
          />
          {/* Keyed so a picked version does not outlive its conference. */}
          <ConferenceText key={conference.id} conference={conference} />
        </Main>
      </Page>
    </>
  )
}
