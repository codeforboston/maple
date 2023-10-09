import { Dropdown, Image } from "../../bootstrap"
import classNames from "classnames"
import styled from "styled-components"
import styles from "./dropdownButton.module.css"
import { CarotIcon } from "./CarotIcon"
import { Fragment } from "react"

export type DropdownButtonProps = {
  title: string
  children: { id: number; itemName: string }[]
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
    fontsize: ${props =>
      props.changefontsize ? props.changefontsize : "16px"};
  }

  .menu {
    width: ${props =>
      props.changewidth?.desktop ? props.changewidth?.desktop : "418px"};
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
  styling
}: DropdownButtonProps): JSX.Element {
  return (
    <StyledDropdown
      changewidth={styling?.width}
      changeheight={styling?.height}
      changefontsize={styling?.fontSize}
    >
      <Dropdown.Toggle
        className={classNames(styles.dropdownToggle, "shadow-none", "toggle")}
        variant="secondary"
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
                key={key.id * 100}
                className={styles.divider}
              ></Dropdown.Divider>
            )}
            <Dropdown.Item
              key={key.id}
              className={classNames(styles.item, "item")}
              href={`#${key.itemName}`}
            >
              {key.itemName}
            </Dropdown.Item>
          </Fragment>
        ))}
      </Dropdown.Menu>
    </StyledDropdown>
  )
}
