import {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { useTranslation } from "next-i18next"
import { takesTestimony } from "../../functions/src/shared"
import styled from "styled-components"
import { ConferenceByline } from "./ConferenceByline"
import { ConferenceCommittee } from "./ConferenceCommittee"
import { ConferenceHero } from "./ConferenceHero"
import { ConferencePicker } from "./ConferencePicker"
import { ConferenceRail } from "./ConferenceRail"
import { ConferenceTabs } from "./ConferenceTabs"
import { ConferenceText } from "./ConferenceText"
import { useAuth } from "../auth"
import { authStepChanged } from "../auth/redux"
import { useConferenceTestimony } from "../db"
import { useAppDispatch } from "../hooks"
import { useConferenceTop, usePinnedNavbar } from "./hooks"
import { InputContext } from "./input/context"
import { InputForm, Step } from "./input/InputForm"
import { Panel, usePanelWidth } from "./input/Panel"
import { PublicInput } from "./input/PublicInput"
import { ShareButton } from "./input/ShareButton"
import { useFollowedAuthors } from "./input/useFollowedAuthors"
import { YourInput } from "./input/YourInput"
import { jumpTo } from "./navbar"
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

/** The page steps aside for the panel at lg and up, where the panel stands
 * beside it rather than over it. The width comes in as --shift, so dragging
 * the panel does not mint a class per pixel. */
const Shift = styled.div`
  @media (min-width: 1024px) {
    padding-right: var(--shift);
    transition: padding-right 400ms ease-out;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

/** The title, with the way to share input at its end. */
const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
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
const SECTIONS = ["committee", "input", "text"] as const

/**
 * One conference: who is deciding, and the two texts they are deciding
 * between, under a hero on what a conference committee is. The list of every
 * conference runs down the left from md up; below that the title opens it.
 * The landing alone opens on the hero (`openOnHero`).
 */
export function ConferenceDetails(
  props: ConferencePageProps & { openOnHero?: boolean }
) {
  // Keyed so moving to another conference starts clean: the panel's draft hook
  // is fixed to the conference it first mounted on, and would keep filing on
  // the old one.
  return <Details key={props.conference.id} {...props} />
}

function Details({
  conference,
  conferences,
  conferees,
  hearings,
  openOnHero = false
}: ConferencePageProps & { openOnHero?: boolean }) {
  const { top, hero, toConference } = useConferenceTop(openOnHero)
  const { t } = useTranslation("conferences")
  const { user, authenticated } = useAuth()
  const dispatch = useAppDispatch()
  const { items, loading } = useConferenceTestimony(
    conference.court,
    conference.id
  )
  const mine = useMemo(
    () => (user ? items.find(x => x.authorUid === user.uid) : undefined),
    [items, user]
  )
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("compose")
  const { width, drag } = usePanelWidth()
  const followed = useFollowedAuthors(user?.uid)
  const subject = conferenceName(conference)
  const taking = takesTestimony(conference.status)

  const close = useCallback(() => setOpen(false), [])
  const edit = useCallback(() => {
    setStep("compose")
    setOpen(true)
  }, [])
  // The same doors the bill page's testimony button goes through.
  const share = () => {
    if (!authenticated) return dispatch(authStepChanged("start"))
    if (!user?.emailVerified) return dispatch(authStepChanged("verifyEmail"))
    edit()
  }
  // Posting puts the panel away and takes the reader to what they filed, once
  // it has arrived in the feed.
  const [landing, setLanding] = useState(false)
  useEffect(() => {
    if (!landing || !mine) return
    setLanding(false)
    const el = document.getElementById("your-input")
    if (el) jumpTo(el)
    history.replaceState(null, "", `${location.pathname}#your-input`)
  }, [landing, mine])
  const posted = () => {
    setOpen(false)
    setLanding(true)
  }

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
  const input = useMemo(
    () => ({
      uid: user?.uid,
      subject,
      followed,
      onEdit: taking ? edit : undefined,
      signedIn: authenticated
    }),
    [user?.uid, subject, followed, taking, edit, authenticated]
  )
  return (
    <InputContext.Provider value={input}>
      <Shift style={{ "--shift": `${open ? width : 0}px` } as CSSProperties}>
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
              <TitleRow>
                <PageTitle as={openOnHero ? "h2" : "h1"}>{subject}</PageTitle>
                {taking && !mine && <ShareButton onClick={share} />}
              </TitleRow>
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
            {mine && (
              <Section>
                <YourInput testimony={mine} />
              </Section>
            )}
            <Section>
              <PublicInput items={items} loading={loading} />
            </Section>
            <Section id="text">
              {/* Keyed so a picked version does not outlive its conference. */}
              <ConferenceText key={conference.id} conference={conference} />
            </Section>
          </Main>
        </Page>
      </Shift>
      {authenticated && user && (
        <Panel
          open={open}
          title={t(
            step === "compose" ? "input.panel_title" : "input.review_title"
          )}
          closeLabel={t("input.close_panel")}
          width={width}
          onDrag={drag}
          onClose={close}
        >
          <InputForm
            uid={user.uid}
            court={conference.court}
            conferenceId={conference.id}
            billId={conference.canonicalBillId}
            subject={subject}
            step={step}
            onStep={setStep}
            onCancel={close}
            onPosted={posted}
          />
        </Panel>
      )}
    </InputContext.Provider>
  )
}
