import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferenceTestimony } from "components/db"
import { useInputContext } from "./context"
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

const Section = styled.section`
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--title-h, 5rem) + 4.5rem
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
  const { followed } = useInputContext()

  const showFilters = items.length === 0 || items.length >= FEED_CONTROLS_MIN
  const shown = useMemo(
    () =>
      showFilters
        ? items.filter(
            (x: ConferenceTestimony) =>
              (position === "all" || x.position === position) &&
              (type === "all" || accountTypeOf(x.authorRole) === type) &&
              (pickedAuthors.length === 0 ||
                pickedAuthors.includes(x.authorUid))
          )
        : items,
    [items, position, type, pickedAuthors, showFilters]
  )
  useEffect(() => setPage(0), [position, type, pickedAuthors])

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
          {followable.length > 0 && (
            <MoreFilters
              followable={followable}
              picked={pickedAuthors}
              onPick={setPickedAuthors}
            />
          )}
        </Controls>
      )}
      {loading ? null : paged.length > 0 ? (
        <>
          <Feed>
            {paged.map(x => (
              <Entry
                key={`${x.authorUid}-${x.id}`}
                testimony={x}
                actions={<Kebab testimony={x} onView={() => setOpened(x)} />}
              />
            ))}
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
