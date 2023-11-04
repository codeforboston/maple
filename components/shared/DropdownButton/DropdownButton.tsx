import { Dropdown, Image } from "../../bootstrap"
import classNames from "classnames"
import styled from "styled-components"
import styles from "./dropdownButton.module.css"
import { CarotIcon } from "./CarotIcon"
import { Fragment } from "react"

export type DropdownButtonProps = {
  title: string
  children: Array<string>
  variant: string
  styling?: stylingProps
}

export type stylingProps = {
  width?: { desktop: string; mobile: string }
  height?: string
  fontSize?: string
}

const StyledDropdown = styled(Dropdown)`
  .toggle {
    width: ${props =>
      props.changewidth?.desktop ? props.changewidth?.desktop : "418px"};
    height: ${props => (props.changeheight ? props.changeheight : "40px")};
    font-size: ${props =>
      props.changefontsize ? props.changefontsize : "1rem"};
  }

  .menu {
    width: ${props =>
      props.changewidth?.desktop ? props.changewidth?.desktop : "418px"};

    font-size: ${props =>
      props.changefontsize ? props.changefontsize : "1rem"};
  }

  .carotIcon {
    fill: #ffffff;
  }

  @media only screen and (max-width: 768px) {
    .toggle {
      width: ${props =>
        props.changewidth?.mobile ? props.changewidth?.mobile : "418px"};
    }
    .menu {
      width: ${props =>
        props.changewidth?.mobile ? props.changewidth?.mobile : "418px"};
    }
  }
`

export function DropdownButton({
  title,
  children,
  variant,
  styling
}: DropdownButtonProps): JSX.Element {
  return (
    <StyledDropdown
      changewidth={styling?.width}
      changeheight={styling?.height}
      changefontsize={styling?.fontSize}
      variant={variant}
    >
      <Dropdown.Toggle
        className={classNames(styles.dropdownToggle, "shadow-none", "toggle")}
        variant={variant}
      >
        {title}
        <CarotIcon></CarotIcon>
      </Dropdown.Toggle>
      <Dropdown.Menu className={classNames(styles.menu, "border", "menu")}>
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
            <Dropdown.Item
              key={key}
              className={classNames(styles.item, "item")}
              href={`#${key}`}
            >
              {key}
            </Dropdown.Item>
          </Fragment>
        ))}
      </Dropdown.Menu>
    </StyledDropdown>
  )
}
