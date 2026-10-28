import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { TABS_H } from "../ConferenceTabs"
import { ConferenceTestimony } from "components/db"
import { useInputContext } from "./context"
import { CosignButton } from "./CosignButton"
import { Band, CosignList, Floor } from "./Cosigns"
import { Entry } from "./Entry"
import { EntryModal } from "./EntryModal"
import { Kebab } from "./Kebab"
import { MoreFilters } from "./MoreFilters"
import { Pagination } from "./Pagination"
import {
  AccountTypeFilter,
  AccountTypePicker,
  PositionFilter,
  PositionPicker
} from "./Pickers"
import { accountTypeOf, nameOf } from "./accounts"
import { brand, ink, line } from "./tokens"

/** Filters appear only once the feed reaches this many entries, or when it has
 * none, so that an empty feed still shows what could narrow it. */
const FEED_CONTROLS_MIN = 4
const PAGE_SIZE = 5

/** A card with the cosigns of it the feed holds, newest first. A cosign whose
 * card is not here stands as a unit of its own. */
type Unit = { lead: ConferenceTestimony; cosigns: ConferenceTestimony[] }

const millis = (t?: { toDate: () => Date }) => (t ? t.toDate().getTime() : 0)

/** Gathers each cosign under what it cosigns, newest first, where a card is as
 * new as its latest cosign: cosigning one brings it back up the feed. */
function unitsOf(items: ConferenceTestimony[]): Unit[] {
  const ids = new Set(items.map(x => x.id))
  const grouped = (x: ConferenceTestimony) =>
    !!x.cosignOfId && ids.has(x.cosignOfId)
  const under = new Map<string, ConferenceTestimony[]>()
  items.filter(grouped).forEach(x => {
    const group = under.get(x.cosignOfId!) ?? []
    group.push(x)
    under.set(x.cosignOfId!, group)
  })
  const byDate = (a: ConferenceTestimony, b: ConferenceTestimony) =>
    millis(b.publishedAt) - millis(a.publishedAt)
  const units = items
    .filter(x => !grouped(x))
    .map(x => ({ lead: x, cosigns: (under.get(x.id) ?? []).sort(byDate) }))
  // The tally's date, or the newest cosign here while the tally catches up.
  const rank = ({ lead, cosigns }: Unit) =>
    Math.max(
      millis(lead.publishedAt),
      millis(lead.lastCosignedAt),
      millis(cosigns[0]?.publishedAt)
    )
  return units.sort((a, b) => rank(b) - rank(a))
}

const Section = styled.section`
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--title-h, 5rem) + ${TABS_H} + 1.5rem
  );
`

const Heading = styled.h2`
  margin: 12px 0 16px;
  font-family: var(--maple-font-heading);
  font-weight: 400;
  font-size: 1.375rem;
  line-height: 1.4;
  color: ${ink.strong};
`

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 28px;
`

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Empty = styled.div`
  padding: 22px;
  text-align: center;
  background: var(--maple-surface-base);
  border: 1.5px dashed ${line.strong};
  border-radius: 12px;

  p {
    margin: 0;
  }
`

const EmptyTitle = styled.p`
  margin-bottom: 4px !important;
  font-size: 1rem;
  font-weight: 600;
  color: ${ink.strong};
`

const EmptyBody = styled.p`
  max-width: 560px;
  margin: 0 auto !important;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${ink.mid};
`

const ClearFilters = styled.button`
  margin-top: 14px;
  padding: 8px 18px;
  background: var(--maple-surface-base);
  border: 1px solid ${brand.fill};
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${brand.fill};
  &:hover {
    background: ${brand.soft};
  }
`

/**
 * Everything filed on a conference, with the controls that narrow it. The way
 * to file is the page's own button, not part of the feed.
 */
export function PublicInput({
  items,
  loading
}: {
  items: ConferenceTestimony[]
  loading: boolean
}) {
  const { t } = useTranslation("conferences")
  const [type, setType] = useState<AccountTypeFilter>("all")
  const [position, setPosition] = useState<PositionFilter>("all")
  const [page, setPage] = useState(0)
  const [pickedAuthors, setPickedAuthors] = useState<string[]>([])
  const [opened, setOpened] = useState<ConferenceTestimony>()
  // Cosigns with no words of their own wait behind a setting; their cards
  // count them either way.
  const [wordless, setWordless] = useState(false)
  const { uid, followed } = useInputContext()

  const showFilters = items.length === 0 || items.length >= FEED_CONTROLS_MIN
  // Ranked with every cosign, so one without words still brings its card up.
  const ranked = useMemo(() => unitsOf(items), [items])
  const units = useMemo(
    () =>
      wordless
        ? ranked
        : ranked.map(u => ({
            ...u,
            cosigns: u.cosigns.filter(c => c.content)
          })),
    [ranked, wordless]
  )
  // The cards the viewer has cosigned, with words or without.
  const mine = useMemo(
    () =>
      new Set(
        items.filter(x => uid && x.authorUid === uid).map(x => x.cosignOfId)
      ),
    [items, uid]
  )
  // A card and its cosigns are narrowed as one: either matching keeps both.
  const shown = useMemo(() => {
    if (!showFilters) return units
    const matches = (x: ConferenceTestimony) =>
      (position === "all" || x.position === position) &&
      (type === "all" || accountTypeOf(x.authorRole) === type) &&
      (pickedAuthors.length === 0 || pickedAuthors.includes(x.authorUid))
    return units.filter(u => matches(u.lead) || u.cosigns.some(matches))
  }, [units, position, type, pickedAuthors, showFilters])
  useEffect(() => setPage(0), [position, type, pickedAuthors, wordless])
  const cosigned = useMemo(() => items.some(x => x.cosignOfId), [items])

  // The accounts being followed that have filed here, which is what the
  // filter mark offers.
  const followable = useMemo(() => {
    const seen = new Map<string, string>()
    items.forEach(x => {
      if (followed.has(x.authorUid) && !seen.has(x.authorUid))
        seen.set(x.authorUid, nameOf(x))
    })
    return [...seen].map(([id, name]) => ({ id, name }))
  }, [items, followed])

  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const paged = shown.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

  return (
    <Section id="input">
      <Heading>{t("input.title")}</Heading>
      {showFilters && (
        <Controls>
          <AccountTypePicker value={type} onChange={setType} />
          <PositionPicker value={position} onChange={setPosition} />
          {(followable.length > 0 || cosigned) && (
            <MoreFilters
              followable={followable}
              picked={pickedAuthors}
              onPick={setPickedAuthors}
              cosigns={cosigned}
              wordless={wordless}
              onWordless={setWordless}
            />
          )}
        </Controls>
      )}
      {loading ? null : paged.length > 0 ? (
        <>
          <Feed>
            {paged.map(({ lead: x, cosigns }) => {
              const banded = !!x.cosignCount && !x.cosignOfId
              return (
                <Entry
                  key={`${x.authorUid}-${x.id}`}
                  testimony={x}
                  lead={!banded && <CosignButton testimony={x} />}
                  band={banded && <Band testimony={x} yours={mine.has(x.id)} />}
                  floor={banded && <Floor testimony={x} />}
                  actions={<Kebab testimony={x} onView={() => setOpened(x)} />}
                  onOpen={setOpened}
                >
                  {wide => (
                    <CosignList
                      cosigns={cosigns}
                      wide={wide}
                      actions={c => (
                        <Kebab testimony={c} onView={() => setOpened(c)} />
                      )}
                    />
                  )}
                </Entry>
              )
            })}
          </Feed>
          {pageCount > 1 && (
            <Pagination page={current} pageCount={pageCount} onPage={setPage} />
          )}
        </>
      ) : (
        <Empty>
          <EmptyTitle>
            {t(
              items.length === 0 ? "input.empty_title" : "input.no_match_title"
            )}
          </EmptyTitle>
          <EmptyBody>
            {t(items.length === 0 ? "input.empty_body" : "input.no_match_body")}
          </EmptyBody>
          {items.length > 0 && (
            <ClearFilters
              type="button"
              onClick={() => {
                setType("all")
                setPosition("all")
                setPickedAuthors([])
              }}
            >
              {t("input.clear_filters")}
            </ClearFilters>
          )}
        </Empty>
      )}
      {opened && (
        <EntryModal testimony={opened} onClose={() => setOpened(undefined)} />
      )}
    </Section>
  )
}
