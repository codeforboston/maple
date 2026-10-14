import styled from "styled-components"
import { ConferenceByline } from "./ConferenceByline"
import { ConferenceCommittee } from "./ConferenceCommittee"
import { ConferencePicker } from "./ConferencePicker"
import { ConferenceRail } from "./ConferenceRail"
import { Title } from "./styles"
import { conferenceName, ConferencePageProps } from "./types"

/** The mockup's column: 1180 wide, and 1320 once the rail sits beside it. */
const Page = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 1.25rem 3rem;
  display: flex;
  gap: 1.5rem;

  @media (min-width: 576px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
  @media (min-width: 992px) {
    max-width: 1320px;
    gap: 3.5rem;
  }
`

const Main = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  padding-top: 1.625rem;
`

const Header = styled.header`
  margin-bottom: 1.5rem;
`

/**
 * One conference: who is deciding, and the two texts they are deciding
 * between. The list of every conference runs down the left from md up; below
 * that the title opens it.
 */
export function ConferenceDetails({
  conference,
  conferences,
  conferees,
  hearings
}: ConferencePageProps) {
  return (
    <Page>
      <ConferenceRail
        className="d-none d-md-block"
        conferences={conferences}
        current={conference.id}
      />
      <Main>
        <Header>
          <div className="d-md-none">
            <ConferencePicker conferences={conferences} current={conference} />
          </div>
          <Title className="d-none d-md-block">
            {conferenceName(conference)}
          </Title>
          <ConferenceByline conference={conference} />
        </Header>
        {/* Keyed so a pinned seat does not outlive its conference. */}
        <ConferenceCommittee
          key={conference.id}
          court={conference.court}
          conferees={conferees}
          hearings={hearings}
        />
      </Main>
    </Page>
  )
}
