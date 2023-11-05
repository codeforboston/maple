import { Dropdown, Image } from "../../bootstrap"
import classNames from "classnames"
import styled from "styled-components"
import styles from "./dropdownButton.module.css"
import { CarotIcon } from "./CarotIcon"

export type DropdownButtonProps = {
  title: string
  children: Array<string>
  variant: string
  className?: string
}

export type stylingProps = {
  width?: { desktop: string; mobile: string }
  height?: string
  fontSize?: string
}

const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle {
    height: 40px;
  }

  .dropdown,
  .dropdown-toggle,
  .dropdown-menu {
    width: 100%;
  }

  .carotIcon {
    fill: #ffffff;
  }
`

export function DropdownButton({
  title,
  children,
  variant,
  className
}: DropdownButtonProps): JSX.Element {
  return (
    <StyledDropdown variant={variant} className={className}>
      <Dropdown.Toggle
        className={classNames(styles.dropdownToggle, "shadow-none", "toggle")}
        variant={variant}
      >
        {title}
        <CarotIcon></CarotIcon>
      </Dropdown.Toggle>
      <Dropdown.Menu className={classNames(styles.menu, "border", "menu")}>
        {children.map((key, i) => [
          i > 0 && (
            <Dropdown.Divider
              key={`${key}-divider}`}
              className={styles.divider}
            />
          ),
          <Dropdown.Item
            key={key}
            className={classNames(styles.item, "item")}
            href={`#${key}`}
          >
            {key}
          </Dropdown.Item>
        ])}
      </Dropdown.Menu>
    </StyledDropdown>
  )
}
