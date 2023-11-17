import { Dropdown } from "../../bootstrap"
import classNames from "classnames"
import styled from "styled-components"
import styles from "./dropdown.module.css"
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

export function DropdownStandard({
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

export function CarotIcon() {
  return (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="carotIcon"
        d="M6.86095 9.05668C6.47395 9.71206 5.52578 9.71206 5.13878 9.05668L0.731956 1.59372C0.338323 0.9271 0.818878 0.0852566 1.59304 0.0852566H10.4067C11.1809 0.0852566 11.6614 0.927101 11.2678 1.59372L6.86095 9.05668Z"
      />
    </svg>
  )
}
