import { Dropdown, Image } from "../../bootstrap"
import classNames from "classnames"
import styled from "styled-components"
import styles from "./dropdownButton.module.css"

export type DropdownButtonProps = {
  title: string
  children: Array<string>
  styling?: stylingProps
}

export type stylingProps = {
  width?: { desktop: string; mobile: string }
  height?: string
  color?: string
  backgroundColor?: string
  fontSize?: string
}

const StyledDropdown = styled(Dropdown)`
  .toggle {
    width: ${props => (props.width?.desktop ? props.width?.desktop : "418px")};
    height: ${props => (props.height ? props.height : "40px")};
    color: ${props => (props.color ? props.color : "#FFFFFF")};
    background-color: ${props =>
      props.backgroundColor ? props.backgroundColor : "#1a3185"};
    fontsize: ${props => (props.fontSize ? props.fontSize : "16px")};
    border-color: ${props =>
      props.backgroundColor ? props.backgroundColor : "#1a3185"};
  }

  .menu {
    width: ${props => (props.width?.desktop ? props.width?.desktop : "418px")};
  }

  @media only screen and (max-width: 768px) {
    .toggle {
      width: ${props => (props.width?.mobile ? props.width?.mobile : "418px")};
    }
    .menu {
      width: ${props => (props.width?.mobile ? props.width?.mobile : "418px")};
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
      width={styling?.width}
      height={styling?.height}
      color={styling?.color}
      backgroundColor={styling?.backgroundColor}
      fontSize={styling?.fontSize}
    >
      <Dropdown.Toggle
        className={classNames(styles.dropdownToggle, "shadow-none", "toggle")}
        variant="outline-secondary"
        id="dropdown-basic"
      >
        {title}
        <Image
          src="/carot-down-white.svg"
          alt="white carot pointing downwards"
        ></Image>
      </Dropdown.Toggle>

      <Dropdown.Menu className={classNames(styles.menu, "border", "menu")}>
        {children.map((item, i) => (
          <>
            {i === 0 ? (
              <></>
            ) : (
              <Dropdown.Divider className={styles.divider}></Dropdown.Divider>
            )}
            <Dropdown.Item key={i} className={styles.item} href={`#${item}`}>
              {item}
            </Dropdown.Item>
          </>
        ))}
      </Dropdown.Menu>
    </StyledDropdown>
  )
}
