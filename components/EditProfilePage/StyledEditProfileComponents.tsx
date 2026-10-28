import { NavProps, TabContainer, TabContent, TabPane } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { Col, Button, Nav, NavDropdown, Row } from "../bootstrap"
import { FC, PropsWithChildren, ReactNode } from "react"
import { ProfileIcon } from "components/ProfilePage/StyledUserIcons"

export const TabNavWrapper = ({ children, className, ...props }: NavProps) => {
  return (
    <Nav
      className={`d-flex w-100 flex-column flex-lg-row flex-lg-nowrap mb-3 text-center h3 color-dark ${className}`}
      {...props}
    >
      {children}
    </Nav>
  )
}

export const TabNavLink = styled(Nav.Link).attrs(props => ({
  className: `rounded-top m-0 p-0 ${props.className}`
}))`
  &.active {
    color: var(--maple-brand-danger);
  }
`

export const TabNavItem = ({
  tab,
  i: i,
  className
}: {
  tab: TabType
  i: number
  className?: string
}) => {
  return (
    <Nav.Item className={`flex-lg-fill ${className}`} key={tab.eventKey}>
      <TabNavLink eventKey={tab.eventKey} className={`rounded-top m-0 p-0`}>
        <p className={`my-0 text-nowrap ${i === 0 ? "" : "mx-4"}`}>
          {tab.title}
        </p>
        <hr className={`my-0`} />
      </TabNavLink>
    </Nav.Item>
  )
}

export const StyledDropdownNav = styled(NavDropdown).attrs(props => ({
  className: props.className
}))`
  font-size: 1.25rem;
  width: auto;
  margin: auto;

  .nav-link,
  a {
    height: 2.25em;
    width: fit-content;
    margin-left: 1rem;
    z-index: 1;
    color: var(--bs-dark);
    background-color: white;
    text-align: left;
  }

  .nav-item .active,
  a.active {
    background-color: white;
  }
`
export type TabType = { title: string; eventKey: string; content: JSX.Element }
export const EditProfileTabContent: FC<
  PropsWithChildren & {
    tabs: TabType[]
  }
> = ({ tabs }) => {
  return (
    <TabContent className={`mt-4 `}>
      {tabs.map(t => (
        <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
          {t.content}
        </TabPane>
      ))}
    </TabContent>
  )
}

export const StyledTabContent = styled(TabContent)`
  margin-top: 3.5rem;
  z-index: -1;

  @media (min-width: 329px) {
    margin-top: 2rem;
  }

  @media (min-width: 517px) {
    margin-top: -0.5rem;
  }

  /* Under the Our Team tabs, which take their own room, the content follows
     in normal flow. */
  *:root && {
    margin-top: 1rem;
    z-index: auto;
  }

  /* The h2 headings left in the tabs (the testimony FAQ's; the cards' titles
     sit in their bands) at the size of the form's subheadings (General info
     and the others), Bootstrap's h4, so all the headings match. Same font,
     weight and line height already; only the size differs. Below 1200px it
     scales as Bootstrap scales h4. */
  *:root && h2 {
    font-size: calc(1.275rem + 0.3vw);
  }

  @media (min-width: 1200px) {
    *:root && h2 {
      font-size: 1.5rem;
    }
  }

  /* Every heading in the tabs, the card headings and the form's subheadings
     alike, in Lexend rather than Bootstrap's Nunito. */
  *:root && :is(h2, h4, h5, h6, .h6) {
    font-family: var(--maple-font-heading);
  }

  /* What is typed or filled in, in Nunito; placeholders stay in Lexend, the
     skin's face. Covers the form fields and the legislator search
     (react-select, leg-search). */
  *:root && :is(input, textarea, select) {
    font-family: var(--maple-font-body);
  }

  /* The legislator search is the exception: its chosen name and what is
     typed in it are in Lexend, as its open list is. */
  *:root && .leg-search__single-value,
  *:root && .leg-search__input-container,
  *:root && .leg-search__input-container input {
    font-family: var(--maple-font-heading);
  }

  *:root && :is(input, textarea)::placeholder,
  *:root && .leg-search__placeholder {
    font-family: var(--maple-font-heading);
  }
`

export const StyledHr = styled.hr`
  height: 2px !important;
  opacity: 100%;
`

export const Header = styled(Row)`
  font-size: 3rem;
  font-weight: 500;
  margin-top: 3.5rem;
  margin-bottom: 3.5rem;
  align-items: center;
`
export const OrgIconSmallStyled = styled(Image).attrs(props => ({
  alt: "",
  src: props.src || "/profile-org-icon.svg",
  className: props.className
}))`
  height: 3rem;
  width: 3rem;
  margin: 1rem;
  border-radius: 50%;
  background-color: var(--bs-white);
  flex: 0;
`
export const OrgIconSmall = styled(ProfileIcon).attrs(props => ({
  className: props.className,
  role: "organization"
}))`
  height: 3rem;
  width: 3rem;
  margin: 1rem;
`

export const VerifiedBadge = styled.div.attrs(props => ({
  className: props.className
}))`
  background-color: var(--bs-blue);
  border-radius: 70px;
  display: flex;
  padding: 3px 25.8px;
  justify-content: center;
  align-content: center;
  text-align: center;

  .verifiedText {
    font-size: 1rem;
    color: white;
    align-self: center;
    justify-self: center;
  }
`
