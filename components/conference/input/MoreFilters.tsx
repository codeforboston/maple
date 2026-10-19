import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Check, ListFilter } from "./icons"
import { ink, line, shadow, wash } from "./tokens"
import { Anchor, Menu, usePopover } from "./popover"

type Followable = { id: string; name: string }

const Mark = styled.button<{ $open: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: ${({ $open }) => ($open ? wash.default : "none")};
  color: ${({ $open }) => ($open ? ink.strong : ink.mid)};
  &:hover {
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
  width: 248px;
  padding: 16px;
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

const Switch = styled.button<{ $on: boolean }>`
  flex-shrink: 0;
  position: relative;
  width: 28px;
  height: 16px;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  background: ${({ $on }) => ($on ? ink.strong : line.strong)};
  transition: background-color 120ms;
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
    transform: translateX(${({ $on }) => ($on ? 12 : 0)}px);
    transition: transform 120ms;
  }
`

const Row = styled.button<{ $on: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 0;
  border: 0;
  background: none;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: ${({ $on }) => ($on ? 600 : 400)};
  color: ${({ $on }) => ($on ? ink.strong : ink.mid)};
  &:hover {
    color: ${ink.strong};
  }
`

const Box = styled.span<{ $on: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  border-radius: 4px;
  border: 1px solid ${({ $on }) => ($on ? ink.strong : line.strong)};
  background: ${({ $on }) => ($on ? ink.strong : "none")};
  color: #fff;
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
  const { ref, open, toggle } = usePopover()
  const all = picked.length === followable.length

  return (
    <Anchor ref={ref}>
      <Mark
        type="button"
        $open={open}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("input.filters")}
      >
        <ListFilter size={17} />
        {picked.length > 0 && <Badge>1</Badge>}
      </Mark>
      {open && (
        <FollowMenu $right>
          <Head>
            <Label>{t("input.following")}</Label>
            <Switch
              type="button"
              role="switch"
              aria-checked={all}
              aria-label={t("input.follow_all")}
              $on={all}
              onClick={() => onPick(all ? [] : followable.map(u => u.id))}
            />
          </Head>
          {followable.map(u => {
            const on = picked.includes(u.id)
            return (
              <Row
                key={u.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={on}
                $on={on}
                onClick={() =>
                  onPick(
                    on ? picked.filter(x => x !== u.id) : [...picked, u.id]
                  )
                }
              >
                <Box $on={on} aria-hidden>
                  {on && <Check size={11} />}
                </Box>
                <Name>{u.name}</Name>
              </Row>
            )
          })}
        </FollowMenu>
      )}
    </Anchor>
  )
}
