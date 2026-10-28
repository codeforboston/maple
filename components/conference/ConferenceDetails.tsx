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
import { ConferenceDifferences } from "./ConferenceDifferences"
import { ConferenceHero } from "./ConferenceHero"
import { ConferencePicker } from "./ConferencePicker"
import { ConferenceRail } from "./ConferenceRail"
import { ConferenceTabs, TABS_H } from "./ConferenceTabs"
import { ConferenceText } from "./ConferenceText"
import { useAuth } from "../auth"
import { authStepChanged } from "../auth/redux"
import {
  ConferenceTestimony,
  ConferenceWorkingDraft,
  useConferenceTestimony,
  useEditConferenceTestimony
} from "../db"
import { useAppDispatch } from "../hooks"
import { useConferenceTop, usePinnedNavbar } from "./hooks"
import { InputContext } from "./input/context"
import { CosignForm, CosignStep } from "./input/CosignForm"
import { CosignLetter } from "./input/CosignLetter"
import { InputForm, Step } from "./input/InputForm"
import { Panel, usePanelWidth } from "./input/Panel"
import { PublicInput } from "./input/PublicInput"
import { ShareButton } from "./input/ShareButton"
import { useFollowedAuthors } from "./input/useFollowedAuthors"
import { YourInput } from "./input/YourInput"
import { jumpToSection } from "./navbar"
import { PageColumn, Title } from "./styles"
import { conferenceName, ConferencePageProps, ConferenceSummary } from "./types"

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

/** A section the tabs lead to, parked under the title and the tabs with the
 * mockup's 24px under them. */
const Section = styled.div`
  margin-top: 1.5rem;
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--title-h, 5rem) + ${TABS_H} + 1.5rem
  );
`

/** In the mockup's order, which goes on to the sections still to come. A
 * conference with nothing written on what is unresolved has no such section. */
const SECTIONS = ["committee", "decided", "input", "text"] as const
const UNDECIDED = SECTIONS.filter(s => s !== "decided")

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
  gist,
  differences,
  similarities,
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
  const byId = useMemo(() => new Map(items.map(x => [x.id, x])), [items])
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("compose")
  // The panel files one of two things: the reader's own input, or a cosign of
  // `cosigning`. Both are the reader's one draft on the conference.
  const [cosigning, setCosigning] = useState<ConferenceTestimony>()
  const [cosignStep, setCosignStep] = useState<CosignStep>("confirm")
  const [full, setFull] = useState(true)
  // What the reader's draft holds, as far as the page cares: what it
  // cosigns, if anything, and whether it has words.
  const [draftOf, setDraftOf] = useState<string | null>(null)
  const [draftWords, setDraftWords] = useState(false)
  const onDraft = useCallback((draft?: ConferenceWorkingDraft) => {
    setDraftOf(draft?.cosignOfId ?? null)
    setDraftWords(!!draft?.content?.trim())
  }, [])
  const { width, drag } = usePanelWidth()
  const followed = useFollowedAuthors(user?.uid)
  const subject = conferenceName(conference)
  const taking = takesTestimony(conference.status)
  const decided = differences.length > 0 || similarities.length > 0

  const close = useCallback(() => setOpen(false), [])
  const compose = useCallback(() => {
    setCosigning(undefined)
    setStep("compose")
    setOpen(true)
  }, [])
  const resumeCosign = useCallback((parent: ConferenceTestimony) => {
    setCosigning(parent)
    setCosignStep("write")
    setOpen(true)
  }, [])
  // A posted cosign is edited as one, its note alone.
  const edit = useCallback(() => {
    if (!mine?.cosignOfId) return compose()
    const parent = byId.get(mine.cosignOfId)
    if (parent) resumeCosign(parent)
  }, [mine, byId, resumeCosign, compose])
  // The same doors the bill page's testimony button goes through; true once
  // the reader is through them.
  const signIn = useCallback(() => {
    if (!authenticated) dispatch(authStepChanged("start"))
    else if (!user?.emailVerified) dispatch(authStepChanged("verifyEmail"))
    else return true
    return false
  }, [authenticated, user?.emailVerified, dispatch])
  // A cosign the reader has written words for is what they come back to; one
  // without words gives way to their own input.
  const resumed = draftWords && draftOf ? byId.get(draftOf) : undefined
  const share = () => {
    if (!signIn()) return
    if (resumed) resumeCosign(resumed)
    else compose()
  }
  const startCosign = useCallback(
    (parent: ConferenceTestimony) => {
      if (!signIn()) return
      if (draftWords && draftOf === parent.id) return resumeCosign(parent)
      setCosigning(parent)
      setCosignStep("confirm")
      setFull(true)
      setOpen(true)
    },
    [signIn, draftOf, draftWords, resumeCosign]
  )
  // Cosigning is the reader's one input here, so it is offered only while they
  // have none: nothing posted, and no words of their own waiting in a draft.
  const offerCosign = taking && !mine && !(draftWords && !draftOf)
  // Posting puts the panel away and takes the reader to what they filed, once
  // it has arrived in the feed.
  const [landing, setLanding] = useState(false)
  useEffect(() => {
    if (!landing || !mine) return
    setLanding(false)
    jumpToSection("your-input")
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
      signedIn: authenticated,
      onCosign: offerCosign ? startCosign : undefined,
      byId
    }),
    [
      user?.uid,
      subject,
      followed,
      taking,
      edit,
      authenticated,
      offerCosign,
      startCosign,
      byId
    ]
  )
  // Signing fills the window with what is signed beside the form; once agreed,
  // the reader may fold it back to the drawer.
  const filled = !!cosigning && (cosignStep === "confirm" || full)
  return (
    <InputContext.Provider value={input}>
      <Shift
        style={
          { "--shift": `${open && !filled ? width : 0}px` } as CSSProperties
        }
      >
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
              <ConferenceTabs sections={decided ? SECTIONS : UNDECIDED} />
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
            {decided && (
              <Section id="decided">
                <ConferenceDifferences
                  gist={gist}
                  differences={differences}
                  similarities={similarities}
                  conferees={conferees}
                  onShare={taking ? share : undefined}
                  posted={Boolean(mine)}
                />
              </Section>
            )}
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
        <InputPanel
          uid={user.uid}
          conference={conference}
          subject={subject}
          open={open}
          width={width}
          onDrag={drag}
          onClose={close}
          step={step}
          onStep={setStep}
          cosigning={cosigning}
          cosignStep={cosignStep}
          onCosignStep={setCosignStep}
          full={filled}
          onFull={setFull}
          onDraft={onDraft}
          onPosted={posted}
        />
      )}
    </InputContext.Provider>
  )
}

/** The panel and the form in it, for a signed-in reader. The reader's draft is
 * held here for both forms, and handed up so the page knows what it holds. */
function InputPanel({
  uid,
  conference,
  subject,
  open,
  width,
  onDrag,
  onClose,
  step,
  onStep,
  cosigning,
  cosignStep,
  onCosignStep,
  full,
  onFull,
  onDraft,
  onPosted
}: {
  uid: string
  conference: ConferenceSummary
  subject: string
  open: boolean
  width: number
  onDrag: (px: number) => void
  onClose: () => void
  step: Step
  onStep: (s: Step) => void
  cosigning?: ConferenceTestimony
  cosignStep: CosignStep
  onCosignStep: (s: CosignStep) => void
  full: boolean
  onFull: (full: boolean) => void
  onDraft: (draft?: ConferenceWorkingDraft) => void
  onPosted: () => void
}) {
  const { t } = useTranslation("conferences")
  const edit = useEditConferenceTestimony(
    uid,
    conference.court,
    conference.canonicalBillId,
    conference.id
  )
  useEffect(() => onDraft(edit.draft), [edit.draft, onDraft])

  const title =
    cosigning && edit.publication
      ? "input.cosign_edit_title"
      : !cosigning && step === "review"
      ? "input.review_title"
      : "input.panel_title"
  return (
    <Panel
      open={open}
      title={t(title)}
      closeLabel={t("input.close_panel")}
      width={width}
      onDrag={onDrag}
      onClose={onClose}
      beside={cosigning && <CosignLetter parent={cosigning} />}
      full={full}
      onFull={cosigning && cosignStep === "write" ? onFull : undefined}
    >
      {cosigning ? (
        // Keyed so another parent starts from its own draft.
        <CosignForm
          key={cosigning.id}
          edit={edit}
          parent={cosigning}
          step={cosignStep}
          onStep={onCosignStep}
          onCancel={onClose}
          onPosted={onPosted}
        />
      ) : (
        <InputForm
          uid={uid}
          edit={edit}
          subject={subject}
          step={step}
          onStep={onStep}
          onCancel={onClose}
          onPosted={onPosted}
        />
      )}
    </Panel>
  )
}
