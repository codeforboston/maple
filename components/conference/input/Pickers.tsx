import { ReactNode } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { AccountType, accountTypes } from "./accounts"
import { ChevronDown, Lectern, Megaphone, UserRound, Users, X } from "./icons"
import { conferencePositions } from "./positions"
import { brand, ink, line, wash } from "./tokens"
import { Anchor, Menu, usePopover } from "./popover"
import { ConferencePosition } from "components/db"

export type AccountTypeFilter = "all" | AccountType
const options: AccountTypeFilter[] = ["all", ...accountTypes]

export type PositionFilter = "all" | ConferencePosition

const Item = styled.button<{ $on: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  border: 0;
  background: none;
  text-align: left;
  font-size: 0.8125rem;
  line-height: 1.35;
  font-weight: ${({ $on }) => ($on ? 600 : 400)};
  color: ${({ $on }) => ($on ? brand.fill : ink.strong)};
  &:hover {
    background: ${wash.default};
  }
`

/** The mockup's account-type icons: a megaphone speaks for an organization. */
export function AccountTypeIcon({
  type,
  size = 16
}: {
  type: AccountType
  size?: number
}) {
  const { t } = useTranslation("conferences")
  const Icon =
    type === "organization"
      ? Megaphone
      : type === "government"
      ? Lectern
      : UserRound
  return (
    <span
      title={t(`input.type_${type}`)}
      style={{ display: "inline-flex", flexShrink: 0, lineHeight: 1 }}
    >
      <Icon size={size} />
    </span>
  )
}

const TypeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--maple-font-heading);
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${ink.strong};
  &:hover {
    color: ${brand.fill};
  }
  @media (min-width: 992px) {
    font-size: 1rem;
  }
`

/** The account-type picker, sitting beside the heading: it names its own
 * selection and changes nothing else. */
export function AccountTypePicker({
  value,
  onChange
}: {
  value: AccountTypeFilter
  onChange: (v: AccountTypeFilter) => void
}) {
  const { t } = useTranslation("conferences")
  const { ref, open, toggle, close } = usePopover()

  const label = (v: AccountTypeFilter) =>
    t(v === "all" ? "input.all_users" : `input.account_${v}`)
  const icon = (v: AccountTypeFilter, size: number): ReactNode =>
    v === "all" ? (
      <Users size={size} />
    ) : (
      <AccountTypeIcon type={v} size={size} />
    )

  return (
    <Anchor ref={ref}>
      <TypeButton
        type="button"
        onClick={() => toggle()}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("input.filter_by_account_type")}
      >
        {icon(value, 17)}
        {label(value)}
        <ChevronDown size={15} />
      </TypeButton>
      {open && (
        <Menu role="listbox">
          {options.map(v => (
            <Item
              key={v}
              type="button"
              role="option"
              aria-selected={v === value}
              $on={v === value}
              onClick={() => {
                onChange(v)
                close()
              }}
            >
              <span
                style={{
                  width: 15,
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                {icon(v, 15)}
              </span>
              {label(v)}
            </Item>
          ))}
        </Menu>
      )}
    </Anchor>
  )
}

const Pill = styled.div<{ $open: boolean; $set: boolean }>`
  display: flex;
  align-items: center;
  height: 34px;
  border: 1px solid ${line.default};
  border-radius: 9999px;
  background: ${({ $open }) => ($open ? wash.default : "transparent")};
  padding-right: ${({ $set }) => ($set ? "4px" : 0)};
  &:hover {
    background: ${wash.default};
  }
`

const PillButton = styled.button<{ $set: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  height: 100%;
  border: 0;
  border-radius: 9999px 0 0 9999px;
  background: none;
  padding: ${({ $set }) => ($set ? "0 7px 0 9px" : "0 10px 0 11px")};
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  color: ${ink.strong};
`

const Clear = styled.button`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 9999px;
  background: none;
  color: ${ink.mid};
  &:hover {
    color: ${ink.strong};
    background: ${wash.strong};
  }
`

/** The four positions as one pill that opens the rest: the pill names the
 * position being looked at, and the menu states all four in full. */
export function PositionPicker({
  value,
  onChange
}: {
  value: PositionFilter
  onChange: (v: PositionFilter) => void
}) {
  const { t } = useTranslation("conferences")
  const { ref, open, toggle, close } = usePopover()
  const short = value === "all" ? null : t(`input.position.${value}.short`)

  return (
    <Anchor ref={ref}>
      <Pill $open={open} $set={!!short}>
        <PillButton
          type="button"
          $set={!!short}
          onClick={() => toggle()}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={
            short
              ? t("input.position_filtered", { position: short })
              : t("input.filter_by_position")
          }
        >
          {short ?? t("input.all_positions")}
          {!short && <ChevronDown size={13} />}
        </PillButton>
        {short && (
          <Clear
            type="button"
            onClick={() => onChange("all")}
            aria-label={t("input.clear_position", { position: short })}
          >
            <X size={13} />
          </Clear>
        )}
      </Pill>
      {open && (
        <Menu role="listbox" style={{ minWidth: 236, width: "max-content" }}>
          {conferencePositions.map(p => (
            <Item
              key={p}
              type="button"
              role="option"
              aria-selected={p === value}
              $on={p === value}
              onClick={() => {
                onChange(p)
                close()
              }}
            >
              {t(`input.position.${p}.long`)}
            </Item>
          ))}
        </Menu>
      )}
    </Anchor>
  )
}
