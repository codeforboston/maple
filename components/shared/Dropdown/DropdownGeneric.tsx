import { Dropdown } from "../../bootstrap"
import classNames from "classnames"
import styled from "styled-components"
import styles from "./dropdown.module.css"
import { CarotIcon } from "./CarotIcon"
import { Fragment } from "react"

//This component serves as a generic styled reusable dropdown.
//It has no functionality.
//Copy and paste this code to a new file to add a new functionality feature.

export type DropdownProps = {
  title: string
  children: Array<string>
  variant: "secondary" | "outline-secondary"
  styling?: stylingProps
}

export type stylingProps = {
  width?: { desktop: string; mobile: string }
  height?: string
  fontSize?: string
}

const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle {
    width: ${props => props.changewidth?.desktop ?? "418px"};
    height: ${props => props.changeheight ?? "40px"};
    font-size: ${props => props.changefontsize ?? "1rem"};
  }

  .dropdown-menu {
    width: ${props => props.changewidth?.desktop ?? "418px"};

    font-size: ${props => props.changefontsize ?? "1rem"};
  }

  .carotIcon {
    fill: ${props =>
      props.variant === "outline-secondary" ? "#1a3185" : "#FFFFFF"};
  }

  @media only screen and (max-width: 768px) {
    .dropdown-toggle {
      width: ${props => props.changewidth?.mobile ?? "418px"};
    }
    .dropdown-menu {
      width: ${props => props.changewidth?.mobile ?? "418px"};
    }
  }
`

export function DropdownGeneric({
  title,
  children,
  variant,
  styling
}: DropdownProps): JSX.Element {
  return (
    <StyledDropdown
      changewidth={styling?.width}
      changeheight={styling?.height}
      changefontsize={styling?.fontSize}
      variant={variant}
    >
      <Dropdown.Toggle
        className={classNames(styles.dropdownToggle, "shadow-none")}
        variant={variant}
      >
        {title}
        <CarotIcon></CarotIcon>
      </Dropdown.Toggle>
      <Dropdown.Menu className={classNames(styles.menu, "border")}>
        {children.map((key, i) => (
          <Fragment key={i * 200}>
            {i === 0 ? (
              <></>
            ) : (
              <Dropdown.Divider
                key={i * 100}
                className={styles.divider}
              ></Dropdown.Divider>
            )}
            <Dropdown.Item key={key} className={classNames(styles.item)}>
              {key}
            </Dropdown.Item>
          </Fragment>
        ))}
      </Dropdown.Menu>
    </StyledDropdown>
  )
}
