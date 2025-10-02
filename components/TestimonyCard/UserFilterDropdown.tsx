import { Dropdown } from "react-bootstrap"
import { ReactEventHandler } from "react"
import styled from "styled-components"
import { useTranslation } from "next-i18next"

export const UserFilterDropDown = (props: {
  users: string
  handleUsers?: ReactEventHandler
}) => {
  const { handleUsers, users } = props
  const { t } = useTranslation("testimony")

  return (
    <DropdownContainer>
      <StyledDropdown variant="success" id="dropdown-basic">
        {"show " + users}
      </StyledDropdown>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleUsers}>
          {t("userFilterDropdown.publishedTestimonies")}
        </Dropdown.Item>
        <Dropdown.Item onClick={handleUsers}>
          {t("userFilterDropdown.usersOnly")}
        </Dropdown.Item>
        <Dropdown.Item onClick={handleUsers}>
          {t("userFilterDropdown.organizationsOnly")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </DropdownContainer>
  )
}

const DropdownContainer = styled(Dropdown)`
  display: flex;
  flex-direction: row-reverse;
  margin: 5px;
`
const StyledDropdown = styled(Dropdown.Toggle)`
  display: flex;
  flex-direction: space-between;
  align-items: center;
  padding: 5px;

  font-size: 1.5rem;
  color: white;

  background-color: #1a3185;
  border: 1px solid #1a3185;

  &:active,
  &:focus,
  &:hover {
    color: black;
    background-color: white !important;
    border-color: black !important;
  }
  &:active,
  &:focus {
    box-shadow: 0px 0px 10px 4px orange !important;
  }
  :after {
    display: flex;
    align-items: center;
    margin-left: auto;
    vertical-align: none;
    content: "▼";
    border-top: none;
    border-right: none;
    border-bottom: none;
    border-left: none;
    font-size: 30px;
  }
`
