import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { Dropdown } from "../bootstrap"
import { RailList } from "./ConferenceRail"
import { Title } from "./styles"
import { conferenceName, ConferenceSummary } from "./types"

const Toggle = styled(Dropdown.Toggle)`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  color: inherit;

  /* A title, not a link: Bootstrap underlines its link buttons. && lifts
     this over that whatever order the stylesheets load in. */
  &&,
  &&:hover,
  &&:focus {
    text-decoration: none;
  }
  &::after {
    display: none;
  }
  &:focus-visible {
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: 4px;
    border-radius: var(--maple-radius-sm);
  }
  .chevron {
    color: var(--maple-text-muted);
    font-size: 0.9rem;
    transition: transform 150ms ease;
  }
  &[aria-expanded="true"] .chevron {
    transform: rotate(180deg);
  }
`

const Menu = styled(Dropdown.Menu)`
  min-width: min(22rem, calc(100vw - 2.5rem));
  max-height: min(60vh, 32rem);
  overflow-y: auto;
  padding: 0.5rem;
  border-radius: var(--maple-radius-lg);
  border-color: var(--maple-surface-border);
  box-shadow: var(--maple-shadow-md);
`

/**
 * The committee list as the title itself, where there is no room for a
 * column: the title opens the same rows the rail shows, and the one being
 * read is marked rather than ticked. The page's heading stays beside it, out
 * of sight.
 */
export function ConferencePicker({
  conferences,
  current
}: {
  conferences: ConferenceSummary[]
  current: ConferenceSummary
}) {
  const { t } = useTranslation("conferences")
  return (
    <Dropdown>
      <Toggle variant="link" aria-label={t("pick_conference")}>
        <Title as="span">{conferenceName(current)}</Title>
        <FontAwesomeIcon className="chevron" icon={faChevronDown} />
      </Toggle>
      <Menu>
        <RailList conferences={conferences} current={current.id} />
      </Menu>
    </Dropdown>
  )
}
