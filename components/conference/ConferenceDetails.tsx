import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import {
  hasReport,
  isSitting,
  takesTestimony
} from "../../functions/src/shared"
import { uncosignable } from "../../functions/src/testimony/cosign"
import styled, { css } from "styled-components"
import { ConferenceByline } from "./ConferenceByline"
import { ConferenceCommittee } from "./ConferenceCommittee"
import { ConferenceDifferences } from "./ConferenceDifferences"
import { FollowConferenceTopicButton } from "../shared/FollowButton"
import { useConferenceFollow } from "./FollowConference"
import { BackChevron, BackToConferences } from "./BackToConferences"
import { ConferenceSwitcher } from "./ConferencePicker"
import { ClosedFold, ConferenceRail } from "./ConferenceRail"
import { ConferenceResolution, OutcomeFilter } from "./ConferenceResolution"
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
import { formatBillId } from "../formatting"
import { Internal, maple, siteUrl } from "../links"
import { useFitText, usePhone, usePinnedNavbar, useRailLift } from "./hooks"
import { InputContext } from "./input/context"
import { CosignForm } from "./input/CosignForm"
import { CosignLetter } from "./input/CosignLetter"
import { InputForm, Step } from "./input/InputForm"
import { Panel } from "./input/Panel"
import { PublicInput } from "./input/PublicInput"
import { ShareButton, ShareFab } from "./input/ShareButton"
import { useFollowedAuthors } from "./input/useFollowedAuthors"
import { Close } from "./input/Close"
import { X } from "./input/icons"
import { jumpToSection } from "./navbar"
import {
  BESIDE,
  COMMITTEE_PAGE_MAX,
  FULL_RAIL_FROM,
  MOBILE_LAYOUT,
  Notice,
  PageColumn,
  PANEL_BESIDE_FROM,
  PANEL_W,
  PHONE_GUTTER,
  RAIL_COMPACT,
  RAIL_COMPACT_BESIDE,
  RAIL_HIDDEN,
  RAIL_SHOWN,
  Title
} from "./styles"
import {
  conferenceName,
  ConferencePageProps,
  ConferenceSummary,
  ConfereeView
} from "./types"

/** The shared column, widened once the rail sits beside it, its content
 * inside the column's 2rem a side. Doubled (&&) so it outranks PageColumn's
 * own max-width whichever of the two is written to the page last, as a live
 * reload of styles.ts writes PageColumn's again. */
const Page = styled(PageColumn)`
  display: flex;
  /* The room between the rail and the page: 56px from 1440px, where the page
     stops widening, narrowing evenly with the page (--page-w, Row) as soon
     as it does, to 24px at 1024px and on down to md, where the rail comes
     in. Never a jump that pulls the page toward the rail. */
  --rail-gap: clamp(
    24px,
    calc(24px + (var(--page-w, 100vw) - 1024px) * 0.0769),
    56px
  );
  gap: var(--rail-gap);

  /* Beside the compact rail (RAIL_COMPACT, styles.ts, or with the panel
     open, RAIL_COMPACT_BESIDE), 20px a side rather than the column's 2rem,
     so the page has more of the width. */
  @media ${RAIL_COMPACT} {
    && {
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }
  }
  @media ${RAIL_COMPACT_BESIDE} {
    ${BESIDE} && {
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }
  }

  /* The committee's column from 992px (COMMITTEE_PAGE_MAX, styles.ts). */
  @media (min-width: 992px) {
    && {
      max-width: ${COMMITTEE_PAGE_MAX};
    }
  }
`

/** The compact rail's width: 200px as it comes in under the full rail
 * (FULL_RAIL_FROM), narrowing with the page (--page-w, Row) to 160px by
 * COMPACT_NARROW_AT, and no narrower on down to where the rail goes for the
 * floating switcher (RAIL_FROM). */
const COMPACT_MIN = 160
const COMPACT_MAX = 200
const COMPACT_NARROW_AT = 992
const COMPACT_WIDTH = `clamp(${COMPACT_MIN}px, calc(${COMPACT_MIN}px + (var(--page-w, 100vw) - ${COMPACT_NARROW_AT}px) * ${
  (COMPACT_MAX - COMPACT_MIN) / (FULL_RAIL_FROM - COMPACT_NARROW_AT)
}), ${COMPACT_MAX}px)`

/** The compact rail's sizes, for `scope`: COMPACT_WIDTH across, the names at
 * 13px over their bills in tighter rows. */
const compactRail = (scope: string) => css`
  ${scope} {
    width: ${COMPACT_WIDTH};
  }
  ${scope} a {
    padding: 6px 8px 6px 10px;
  }
  ${scope} .name {
    font-size: 0.8125rem;
  }
`

/** The list of every conference down the left, from RAIL_FROM (styles.ts):
 * compact at first (RAIL_COMPACT), and beside the panel while the page it
 * leaves is that narrow or narrower (RAIL_COMPACT_BESIDE); its full size
 * from FULL_RAIL_FROM. */
const SideRail = styled(ConferenceRail)`
  @media ${RAIL_HIDDEN} {
    display: none;
  }

  @media ${RAIL_COMPACT} {
    ${compactRail("&&")}
  }
  @media ${RAIL_COMPACT_BESIDE} {
    ${compactRail(`${BESIDE} &`)}
  }
`

/** The page and, from lg up, the input panel's column beside it (Panel.tsx),
 * under the beta note, which runs across the window over both. The panel
 * pins in its column as the rail does in the page, and leaves with the page's
 * end; below lg it is a sheet over the window instead. */
const Row = styled.div`
  display: flex;
  /* The page's width, for what sizes itself by it (the rail and the gap
     after it): the window's, less the panel while it stands beside the page
     (data-panel, BESIDE in styles.ts). */
  --page-w: 100vw;

  @media (min-width: ${PANEL_BESIDE_FROM}px) {
    &${BESIDE} {
      --page-w: calc(100vw - ${PANEL_W}px);
    }
  }
`

/** The way back and the page, in what the panel leaves them. */
const Column = styled.div`
  flex: 1;
  min-width: 0;
`

/** The title, with the ways to follow and to share input at its end, from
 * md, while the title fits beside them on one line. Once it would wrap there,
 * it takes a line of its own under them (wrap-reverse stacks its line under
 * theirs), the buttons kept to the right over it. The title's own length
 * decides, whatever the window or the panel beside the page. On mobile the
 * buttons float at the foot instead (ShareFab, FabDock), and the title has
 * the row. */
const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap-reverse;
  /* Wrapping reversed, the line's top is its cross end. */
  align-items: flex-end;
  gap: 16px 24px;
`

/** Following the conference and the way to share input, at the title's
 * end, from md (TitleRow). */
const TitleShare = styled.div`
  display: flex;
  flex: none;
  align-items: center;
  gap: 18px;
  /* At the right, beside the title or over it. */
  margin-left: auto;

  /* The Follow button (components/shared/FollowButton.tsx) 6px above and
     below, as Share your input is (ShareButton.tsx). !important outranks
     its py-1, which is !important itself. */
  && .follow-button .btn {
    padding-top: 0.375rem !important;
    padding-bottom: 0.375rem !important;
  }

  @media ${RAIL_HIDDEN} {
    display: none;
  }
`

/** The title, and on mobile, below md, the way back before it
 * (BackChevron). */
const TitleCell = styled.div`
  display: flex;
  /* As wide as the title on one line, to share the row with the buttons
     (TitleRow); narrower only on a line of its own. */
  flex: 1 1 auto;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;

  /* In the mobile layout, the title centred across the row, the way back at the left
     (its 26px in the row, the rest over the page's edge, BackChevron) and as
     much room kept empty at the right, so the title's middle is the row's.
     Both centred on the title's one line, whatever size that fits at
     (useFitText). */
  @media ${MOBILE_LAYOUT} {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 26px;
    align-items: center;
    gap: 8px;
  }
`

/** Where the floating buttons are held on mobile, without the rail
 * (RAIL_HIDDEN, styles.ts): the way to the other conferences at the left
 * (SwitcherSlot), and the way to share input at the right (ShareFab). At
 * the end of the page's column, pinned 24px off the bottom of the screen
 * while the column runs on under it, and left at the column's end when it
 * stops, so it never floats over the footer. Its row lets taps through
 * around the buttons. */
const FabDock = styled.div`
  position: sticky;
  bottom: 24px;
  z-index: 15;
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
  /* The way in at the right, with or without the way to the others. */
  > :last-child {
    margin-left: auto;
  }

  /* With the rail, the way in is at the title's end, and the rail is there
     to move between conferences by. */
  @media ${RAIL_SHOWN} {
    display: none;
  }
`

/** The way to the other conferences in the dock, only where the rail is
 * gone. */
const SwitcherSlot = styled.div`
  @media ${RAIL_SHOWN} {
    display: none;
  }
`

/** The header and the sections under it. */
const Main = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

/** `$muted`: a conference we haven't covered, its name in the rail's muted
 * grey (ConferenceRail.tsx). 29.7px up to 992px, growing evenly to 36px at
 * 1440px. */
const PageTitle = styled(Title)<{ $muted: boolean }>`
  && {
    font-size: clamp(29.7px, calc(29.7px + (100vw - 992px) * 0.01406), 36px);
  }
  min-width: 0;
  ${({ $muted }) => ($muted ? "color: var(--maple-text-muted);" : "")}

  /* In the mobile layout, a step larger, 32px, centred in the row's middle (TitleCell),
     and always one line, the type stepped down to fit it where the name is
     longer than that (useFitText), and cut short with an ellipsis past
     that. */
  @media ${MOBILE_LAYOUT} {
    && {
      font-size: 32px;
    }
    grid-column: 2;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

/** Why a link to cosign an input did not open the panel, with a way to put
 * it away. */
const LinkNotice = styled(Notice)`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 0.625rem;
`

/** Why a link to cosign could not open the panel. */
type LinkRefusal =
  | "removed"
  | "not_cosignable"
  | "closed"
  | "filed"
  | "drafting"

/** A band that holds at the top while the sections scroll under it, run out
 * to the page's gutters so what passes behind it is covered. On the left,
 * from md, where the rail is beside it, only as far as the rail (the
 * page's --rail-gap): no further, or it would paint over the rail's edge
 * where the gap is under the 2rem. */
const Band = styled.div<{ $top: string; $z: number }>`
  position: sticky;
  top: ${({ $top }) => $top};
  z-index: ${({ $z }) => $z};
  margin: 0 calc(-1 * ${PHONE_GUTTER});
  padding: 0 ${PHONE_GUTTER};
  background: var(--maple-surface-page);

  @media (min-width: 576px) {
    margin: 0 -2rem;
    padding: 0 2rem;
  }

  @media ${RAIL_SHOWN} {
    margin-left: calc(-1 * var(--rail-gap));
    padding-left: var(--rail-gap);
  }

  /* Out to the page's narrower right side beside the compact rail (Page):
     in a narrow window, or with the input panel leaving the page that
     narrow. */
  @media ${RAIL_COMPACT} {
    margin-right: -1.25rem;
    padding-right: 1.25rem;
  }
  @media ${RAIL_COMPACT_BESIDE} {
    ${BESIDE} && {
      margin-right: -1.25rem;
      padding-right: 1.25rem;
    }
  }
`

const TitleBand = styled(Band)`
  padding-top: 1.625rem;
  padding-bottom: 0.75rem;

  /* In the mobile layout, more room between the title and the byline under
     it. */
  @media ${MOBILE_LAYOUT} {
    padding-bottom: 1rem;
  }
`

/** A section the tabs lead to, parked under the title and the tabs with the
 * mockup's 24px under them, and 24px from the section before. */
const Section = styled.div`
  margin-top: 1.5rem;
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--title-h, 5rem) + ${TABS_H} + 1.5rem
  );
`

/** In the mockup's order, which goes on to the sections still to come. A
 * conference with nothing written on what is unresolved has no such section. */
const SECTIONS = ["committee", "decided", "input", "text"] as const

/** Once resolved, the questions are the resolved text. */
const RESOLVED_LABELS = { decided: "tab_resolved" }

/**
 * One conference: who is deciding, and the two texts they are deciding
 * between. The list of every conference runs down the left from md up; below
 * that the title opens it.
 */
export function ConferenceDetails(props: ConferencePageProps) {
  const fold = useClosedFold(props.conference)
  // Keyed so moving to another conference starts clean: the panel's draft hook
  // is fixed to the conference it first mounted on, and would keep filing on
  // the old one.
  return <Details key={props.conference.id} {...props} fold={fold} />
}

/**
 * Whether the rail's group of past conferences is open (PastFold,
 * ConferenceRail.tsx), held above the keyed page so it lasts from one
 * conference to the next. It starts open only on a conference in the group,
 * and opens on arriving at one, so the conference being read is never folded
 * away; otherwise it stays as the reader left it.
 */
function useClosedFold(conference: ConferenceSummary): ClosedFold {
  const closed = !isSitting(conference)
  const [open, setOpen] = useState(closed)
  const [at, setAt] = useState(conference.id)
  if (at !== conference.id) {
    setAt(conference.id)
    if (closed) setOpen(true)
  }
  return { open, onToggle: setOpen }
}

function Details({
  conference,
  conferences,
  conferees,
  hearings,
  gist,
  differences,
  similarities,
  testimonyCount,
  fold
}: ConferencePageProps & { fold: ClosedFold }) {
  // The page, which holds the rail and the main column; useRailLift measures
  // it.
  const top = useRef<HTMLDivElement>(null)
  const { t } = useTranslation("conferences")
  const { user, authenticated, loading: authLoading, authFlowStep } = useAuth()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const {
    items,
    loading,
    error: feedError
  } = useConferenceTestimony(conference.court, conference.id)
  const mine = useMemo(
    () => (user ? items.find(x => x.authorUid === user.uid) : undefined),
    [items, user]
  )
  const byId = useMemo(() => new Map(items.map(x => [x.id, x])), [items])
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("write")
  // The panel files one of two things: the reader's own input, or a cosign of
  // `cosigning`. Both are the reader's one draft on the conference.
  const [cosigning, setCosigning] = useState<ConferenceTestimony>()
  const [full, setFull] = useState(true)
  // The reader's own input in the drawer until they open it out to the
  // window, and only while writing.
  const [inputFull, setInputFull] = useState(false)
  // What the reader's draft holds, as far as the page cares: what it
  // cosigns, if anything, and whether it has words.
  const [draftOf, setDraftOf] = useState<string | null>(null)
  const [draftWords, setDraftWords] = useState(false)
  // Whether the reader's draft has been read, so the page decides on it.
  const [draftRead, setDraftRead] = useState(false)
  const onDraft = useCallback(
    (draft?: ConferenceWorkingDraft, read = false) => {
      setDraftOf(draft?.cosignOfId ?? null)
      setDraftWords(!!draft?.content?.trim())
      setDraftRead(read)
    },
    []
  )
  const followed = useFollowedAuthors(user?.uid)
  const subject = conferenceName(conference)
  const taking = takesTestimony(conference)
  const follow = useConferenceFollow(conference)
  const decided = differences.length > 0 || similarities.length > 0
  // Once the report is filed, each question says how the law resolved it.
  const resolved = hasReport(conference) && differences.length > 0
  // Shared by the resolution's bar and the questions' filter row.
  const [filter, setFilter] = useState<OutcomeFilter>("all")
  // A segment of the bar takes the reader to the questions it picks.
  const pick = (f: OutcomeFilter) => {
    setFilter(f)
    jumpToSection("decided")
  }
  // Input belongs to the conferences we cover, and once one has closed, only
  // where someone gave it.
  const heard = taking || (conference.covered && testimonyCount > 0)
  const sections = useMemo(
    () =>
      SECTIONS.filter(
        s => (s !== "decided" || decided) && (s !== "input" || heard)
      ),
    [decided, heard]
  )

  const close = useCallback(() => setOpen(false), [])
  const compose = useCallback(() => {
    setCosigning(undefined)
    setStep("write")
    setInputFull(false)
    setOpen(true)
  }, [])
  const resumeCosign = useCallback((parent: ConferenceTestimony) => {
    setCosigning(parent)
    setStep("write")
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
      setStep("confirm")
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

  // A link to cosign one input (`?cosign=<id>`) does what its card's Cosign
  // does once the feed and the reader are known, or says why it can't. A
  // reader who must sign in first keeps the link in the address, so it picks
  // up again once they are through, here or after a reload.
  const linked =
    typeof router.query.cosign === "string" ? router.query.cosign : undefined
  const [refusal, setRefusal] = useState<LinkRefusal>()
  const [focus, setFocus] = useState<string>()
  // The door last opened for the link: signing in, then verifying the email,
  // which signing in to an unverified account does not ask for by itself.
  const prompted = useRef<"start" | "verifyEmail">(undefined)
  // Once acted on, until the address lets go of it.
  const acted = useRef<string>(undefined)
  useEffect(() => {
    if (!linked) {
      acted.current = undefined
      prompted.current = undefined
      return
    }
    if (authLoading || loading || feedError) return
    if (acted.current === linked) return
    const done = () => {
      acted.current = linked
      return router.replace(maple.conference(conference), undefined, {
        shallow: true,
        scroll: false
      })
    }
    const parent = byId.get(linked)
    // A cosign's card is the one it cosigns.
    const card =
      parent?.cosignOfId && byId.has(parent.cosignOfId)
        ? parent.cosignOfId
        : parent?.id
    const refuse = (why: LinkRefusal) => {
      setRefusal(why)
      setFocus(card)
      done()
    }
    if (!parent) return refuse("removed")
    if (uncosignable(parent)) return refuse("not_cosignable")
    if (!taking) return refuse("closed")
    if (!authenticated || !user?.emailVerified) {
      // Signing up ends on verifying by itself; signing in does not.
      if (authFlowStep === "verifyEmail") prompted.current = "verifyEmail"
      if (authFlowStep) return
      const door = authenticated ? "verifyEmail" : "start"
      if (prompted.current !== door) signIn()
      prompted.current = door
      return
    }
    if (!draftRead) return
    if (mine) {
      setRefusal("filed")
      done().then(() => jumpToSection("your-input"))
      return
    }
    // What is left of the rule that offers Cosign: no words of their own.
    if (!offerCosign) return refuse("drafting")
    startCosign(parent)
    done()
  }, [
    linked,
    authLoading,
    loading,
    feedError,
    router,
    conference,
    byId,
    taking,
    authenticated,
    user?.emailVerified,
    authFlowStep,
    signIn,
    draftRead,
    mine,
    offerCosign,
    startCosign
  ])

  // The tabs hold under the title, so they need its height.
  const main = useRef<HTMLDivElement>(null)
  const band = useRef<HTMLDivElement>(null)
  // On mobile, the title's one line fitted to its room, from 32px down to
  // 20px (PageTitle).
  const titleText = useRef<HTMLHeadingElement>(null)
  const phone = usePhone()
  useFitText(titleText, phone, 20, subject)
  // On the page and the panel's column beside it, not only the main column,
  // so the rail (ConferenceRail.tsx) and the panel (Panel.tsx) pin at the
  // navbar's edge with the title.
  const row = useRef<HTMLDivElement>(null)
  usePinnedNavbar(row)
  // The title and the tabs leave with the rail once the page's end pushes it
  // up, rather than holding on after it.
  useRailLift(top, main)
  useLayoutEffect(() => {
    const el = band.current
    if (!el) return
    const read = () => {
      // Exact sizes, not offsetHeight's whole pixels, which can fall short of
      // a fractional height and leave a seam under it.
      main.current?.style.setProperty(
        "--title-h",
        `${el.getBoundingClientRect().height}px`
      )
    }
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
      cosignLink: taking
        ? (x: ConferenceTestimony) =>
            siteUrl(maple.conference({ ...conference, cosign: x.id }))
        : undefined,
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
      conference,
      byId
    ]
  )
  // Signing fills the window with what is signed beside the form; once agreed,
  // the reader may fold it back to the drawer. The reader's own input opens in
  // the drawer and fills the window only while they write and ask it to; its
  // review is always the drawer.
  const filled = cosigning
    ? step === "confirm" || full
    : inputFull && step === "write"
  return (
    <InputContext.Provider value={input}>
      {/* Whether the panel stands beside the page, for what sizes itself
          by the page it leaves rather than the window (BESIDE and
          NOT_BESIDE, styles.ts). */}
      <Row ref={row} data-panel={open && !filled ? "beside" : "none"}>
        <Column>
          {/* Not on mobile, where a chevron before the title is the way back
              instead. */}
          <BackToConferences divider notMobile committee />
          <Page ref={top}>
            <SideRail
              conferences={conferences}
              current={conference.id}
              fold={fold}
            />
            <Main ref={main}>
              <TitleBand
                ref={band}
                $top="calc(var(--maple-navbar-height) + var(--rail-lift, 0px))"
                $z={14}
              >
                <TitleRow>
                  <TitleCell>
                    <BackChevron />
                    <PageTitle ref={titleText} $muted={!conference.covered}>
                      {subject}
                    </PageTitle>
                  </TitleCell>
                  {(taking || follow.visible) && (
                    <TitleShare>
                      {follow.visible && (
                        <FollowConferenceTopicButton conference={conference} />
                      )}
                      {taking && (
                        <ShareButton onClick={share} disabled={Boolean(mine)} />
                      )}
                    </TitleShare>
                  )}
                </TitleRow>
                {refusal && (
                  <LinkNotice role="status">
                    {t(`input.cosign_link_${refusal}`)}
                    <Close
                      type="button"
                      aria-label={t("input.close")}
                      onClick={() => setRefusal(undefined)}
                    >
                      <X size={16} />
                    </Close>
                  </LinkNotice>
                )}
              </TitleBand>
              <ConferenceByline conference={conference} />
              <Band
                // 1px under the title's band, which sits above it, so no seam
                // opens between the two however the heights round.
                $top="calc(var(--maple-navbar-height) + var(--rail-lift, 0px) + var(--title-h, 5rem) - 1px)"
                $z={13}
              >
                <ConferenceTabs
                  sections={sections}
                  labels={resolved ? RESOLVED_LABELS : undefined}
                />
              </Band>
              {resolved && (
                <Section>
                  <ConferenceResolution
                    differences={differences}
                    settled={similarities.length}
                    filter={filter}
                    onFilter={pick}
                  />
                </Section>
              )}
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
                    resolved={resolved}
                    filter={filter}
                    onFilter={setFilter}
                  />
                </Section>
              )}
              {heard && (
                <Section>
                  <PublicInput items={items} loading={loading} focus={focus} />
                </Section>
              )}
              <Section id="text">
                {/* Keyed so a picked version does not outlive its conference. */}
                <ConferenceText key={conference.id} conference={conference} />
              </Section>
              {/* On mobile, the floating buttons: the way to the other
                  conferences at the left, and the way in at the right, gone
                  while the panel is out and once something is filed. */}
              <FabDock>
                <SwitcherSlot>
                  <ConferenceSwitcher
                    conferences={conferences}
                    current={conference}
                    fold={fold}
                  />
                </SwitcherSlot>
                {taking && !mine && !open && <ShareFab onClick={share} />}
              </FabDock>
            </Main>
          </Page>
        </Column>
        {authenticated && user && (
          <InputPanel
            uid={user.uid}
            conference={conference}
            conferees={conferees}
            subject={subject}
            open={open}
            onClose={close}
            step={step}
            onStep={setStep}
            cosigning={cosigning}
            full={filled}
            onFull={cosigning ? setFull : setInputFull}
            onDraft={onDraft}
            onPosted={posted}
          />
        )}
      </Row>
    </InputContext.Provider>
  )
}

/** The panel and the form in it, for a signed-in reader. The reader's draft is
 * held here for both forms, and handed up so the page knows what it holds. */
function InputPanel({
  uid,
  conference,
  conferees,
  subject,
  open,
  onClose,
  step,
  onStep,
  cosigning,
  full,
  onFull,
  onDraft,
  onPosted
}: {
  uid: string
  conference: ConferenceSummary
  conferees: ConfereeView[]
  subject: string
  open: boolean
  onClose: () => void
  step: Step
  onStep: (s: Step) => void
  cosigning?: ConferenceTestimony
  full: boolean
  onFull: (full: boolean) => void
  onDraft: (draft?: ConferenceWorkingDraft, read?: boolean) => void
  onPosted: () => void
}) {
  const { t } = useTranslation("conferences")
  const edit = useEditConferenceTestimony(
    uid,
    conference.court,
    conference.canonicalBillId,
    conference.id
  )
  // Signing out takes the draft with it.
  useEffect(() => {
    onDraft(edit.draft, !edit.loading)
    return () => onDraft(undefined)
  }, [edit.draft, edit.loading, onDraft])

  const mode = cosigning ? "cosign_" : ""
  const title =
    step === "review"
      ? `input.${mode}review_title`
      : !cosigning
      ? "input.panel_title"
      : edit.publication
      ? "input.cosign_edit_title"
      : "input.cosign_title"
  return (
    <Panel
      open={open}
      title={t(title)}
      closeLabel={t("input.close_panel")}
      onClose={onClose}
      beside={cosigning && <CosignLetter parent={cosigning} />}
      // Below lg, stacked over the form, the letter is read once, to agree
      // to it, and not again while writing.
      besideStacked={step === "confirm"}
      full={full}
      onFull={step === "write" ? onFull : undefined}
    >
      {cosigning ? (
        // Keyed so another parent starts from its own draft.
        <CosignForm
          key={cosigning.id}
          edit={edit}
          parent={cosigning}
          court={conference.court}
          conferenceId={conference.id}
          subject={subject}
          conferees={conferees}
          step={step}
          onStep={onStep}
          onCancel={onClose}
          onPosted={onPosted}
        />
      ) : (
        <InputForm
          court={conference.court}
          conferenceId={conference.id}
          conferees={conferees}
          edit={edit}
          subject={subject}
          bills={{
            senate: formatBillId(conference.senateBillId),
            house: formatBillId(conference.houseBillId)
          }}
          full={full}
          step={step}
          onStep={onStep}
          onCancel={onClose}
          onPosted={onPosted}
        />
      )}
    </Panel>
  )
}
