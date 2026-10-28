import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Check, ListFilter } from "./icons"
import { ink, line, shadow, wash } from "./tokens"
import { Anchor, Menu, Toggle } from "./menu"
import { Dropdown } from "components/bootstrap"

type Followable = { id: string; name: string }

const Mark = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: ${ink.mid};
  &:hover,
  &[aria-expanded="true"] {
    background: ${wash.default};
    color: ${ink.strong};
  }
`

const Badge = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 9999px;
  background: ${ink.strong};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
`

const FollowMenu = styled(Menu)`
  && {
    --bs-dropdown-padding-x: 16px;
    --bs-dropdown-padding-y: 16px;
    width: 248px;
  }
`

/** The rows and the switch are the menu's items, so the arrow keys reach
 * them, but none of them takes Bootstrap's fill: the mockup marks them by
 * their own ink, and the keyboard by the focus ring. */
const Plain = styled.button`
  --bs-dropdown-link-hover-bg: transparent;
  --bs-dropdown-link-active-bg: transparent;
  &:focus-visible {
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: 2px;
  }
`

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
`

const Label = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${ink.mid};
`

const Switch = styled(Plain)`
  && {
    flex-shrink: 0;
    position: relative;
    width: 28px;
    height: 16px;
    padding: 0;
    border: 0;
    border-radius: 9999px;
    background: ${line.strong};
    transition: background-color 120ms;
  }
  &&[aria-checked="true"] {
    background: ${ink.strong};
  }
  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 9999px;
    background: #fff;
    box-shadow: ${shadow.popover};
    transition: transform 120ms;
  }
  &[aria-checked="true"]::after {
    transform: translateX(12px);
  }
`

const Row = styled(Plain)`
  --bs-dropdown-item-padding-y: 5px;
  --bs-dropdown-item-padding-x: 0;
  --bs-dropdown-link-color: ${ink.mid};
  && {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
  &&[aria-checked="true"] {
    --bs-dropdown-link-color: ${ink.strong};
    font-weight: 600;
  }
`

/** The tick, drawn from its row's state. */
const Box = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  border-radius: 4px;
  border: 1px solid ${line.strong};
  color: #fff;
  [aria-checked="true"] > & {
    border-color: ${ink.strong};
    background: ${ink.strong};
  }
`

const Name = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

/** The filters that do not earn a pill of their own, behind one mark that
 * carries a count once something inside is set. Here that is the accounts the
 * reader follows: none picked means everyone. */
export function MoreFilters({
  followable,
  picked,
  onPick
}: {
  followable: Followable[]
  picked: string[]
  onPick: (ids: string[]) => void
}) {
  const { t } = useTranslation("conferences")
  const all = picked.length === followable.length

  return (
    <Anchor align="end" autoClose="outside">
      <Toggle as={Mark} type="button" aria-label={t("input.filters")}>
        <ListFilter size={17} />
        {picked.length > 0 && <Badge>1</Badge>}
      </Toggle>
      <FollowMenu role="menu">
        <Head>
          <Label>{t("input.following")}</Label>
          <Dropdown.Item
            as={Switch}
            type="button"
            role="switch"
            aria-checked={all}
            aria-label={t("input.follow_all")}
            onClick={() => onPick(all ? [] : followable.map(u => u.id))}
          />
        </Head>
        {followable.map(u => {
          const on = picked.includes(u.id)
          return (
            <Dropdown.Item
              key={u.id}
              as={Row}
              type="button"
              role="menuitemcheckbox"
              aria-checked={on}
              onClick={() =>
                onPick(on ? picked.filter(x => x !== u.id) : [...picked, u.id])
              }
            >
              <Box aria-hidden>{on && <Check size={11} />}</Box>
              <Name>{u.name}</Name>
            </Dropdown.Item>
          )
        })}
      </FollowMenu>
    </Anchor>
  )
}
