import { ReactNode } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { AccountType, accountTypes } from "./accounts"
import { ChevronDown, Lectern, Megaphone, UserRound, Users, X } from "./icons"
import { conferencePositions } from "./positions"
import { brand, ink, line, wash } from "./tokens"
import { Anchor, Menu, Toggle, useRoom } from "./menu"
import { Dropdown } from "components/bootstrap"
import { ConferencePosition } from "components/db"

export type AccountTypeFilter = "all" | AccountType
const options: AccountTypeFilter[] = ["all", ...accountTypes]

export type PositionFilter = "all" | ConferencePosition

/** A choice in either picker. The current one is marked in the brand's
 * colour; on a phone the rows grow to a thumb's height. */
const Item = styled.button`
  --bs-dropdown-item-padding-y: 6px;
  --bs-dropdown-item-padding-x: 12px;
  --bs-dropdown-link-color: ${ink.strong};
  --bs-dropdown-link-hover-color: var(--bs-dropdown-link-color);
  --bs-dropdown-link-active-color: var(--bs-dropdown-link-color);
  && {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: normal;
    font-weight: 500;
  }
  &&[aria-checked="true"] {
    --bs-dropdown-link-color: ${brand.fill};
    font-weight: 600;
  }
  @media (max-width: 639.98px) {
    --bs-dropdown-item-padding-y: 16px;
    --bs-dropdown-item-padding-x: 16px;
  }
`

const PickerMenu = styled(Menu)`
  @media (max-width: 639.98px) {
    && {
      --bs-dropdown-padding-y: 8px;
    }
  }
`

/** The position sentences, as wide as the longest on a desktop and wrapping
 * inside the screen on a phone. */
const PositionMenu = styled(PickerMenu)`
  && {
    --bs-dropdown-min-width: 236px;
    width: max-content;
  }
  && .dropdown-item {
    line-height: 1.35;
  }
  @media (max-width: 639.98px) {
    && {
      --bs-dropdown-min-width: 0;
      width: min(340px, calc(100vw - 32px));
    }
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
  const { ref, onToggle, style } = useRoom()

  // The menu names everyone "All Accounts"; the control names them as users.
  const label = (v: AccountTypeFilter, inMenu = false) =>
    t(
      v !== "all"
        ? `input.account_${v}`
        : inMenu
        ? "input.all_accounts"
        : "input.all_users"
    )
  const icon = (v: AccountTypeFilter, size: number): ReactNode =>
    v === "all" ? (
      <Users size={size} />
    ) : (
      <AccountTypeIcon type={v} size={size} />
    )

  return (
    <Anchor ref={ref} onToggle={onToggle}>
      <Toggle
        as={TypeButton}
        type="button"
        aria-label={t("input.filter_by_account_type")}
      >
        {icon(value, 17)}
        {label(value)}
        <ChevronDown size={15} />
      </Toggle>
      <PickerMenu role="menu" style={style}>
        {options.map(v => (
          <Dropdown.Item
            key={v}
            as={Item}
            type="button"
            role="menuitemradio"
            aria-checked={v === value}
            onClick={() => onChange(v)}
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
            {label(v, true)}
          </Dropdown.Item>
        ))}
      </PickerMenu>
    </Anchor>
  )
}

const Pill = styled.div<{ $set: boolean }>`
  display: flex;
  align-items: center;
  height: 34px;
  border: 1px solid ${line.default};
  border-radius: 9999px;
  padding-right: ${({ $set }) => ($set ? "4px" : 0)};
  &:hover,
  .show > & {
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
  svg {
    color: ${ink.mid};
  }
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
  const { ref, onToggle, style } = useRoom()
  const short = value === "all" ? null : t(`input.position.${value}.short`)

  return (
    <Anchor ref={ref} onToggle={onToggle}>
      <Pill $set={!!short}>
        <Toggle
          as={PillButton}
          type="button"
          $set={!!short}
          aria-label={
            short
              ? t("input.position_filtered", { position: short })
              : t("input.filter_by_position")
          }
        >
          {short ?? t("input.all_positions")}
          {!short && <ChevronDown size={13} />}
        </Toggle>
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
      <PositionMenu role="menu" style={style}>
        {conferencePositions.map(p => (
          <Dropdown.Item
            key={p}
            as={Item}
            type="button"
            role="menuitemradio"
            aria-checked={p === value}
            onClick={() => onChange(p)}
          >
            {t(`input.position.${p}.long`)}
          </Dropdown.Item>
        ))}
      </PositionMenu>
    </Anchor>
  )
}
