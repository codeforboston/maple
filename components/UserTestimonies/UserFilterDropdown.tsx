import { Dropdown } from "react-bootstrap"
import { useState, ReactEventHandler } from "react"
import styled from "styled-components"

export const UserFilterDropDown = (props: {
  users: string
  handleUsers?: ReactEventHandler
}) => {
  const { handleUsers, users } = props

  const [orderBy, setOrderBy] = useState<string>("All Published Testimonies")

  return (
    <DropdownContainer>
      <StyledDropdown variant="success" id="dropdown-basic">
        {"show " + users}
      </StyledDropdown>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleUsers}>
          All Published Testimonies
        </Dropdown.Item>
        <Dropdown.Item onClick={handleUsers}>Users Only</Dropdown.Item>
        <Dropdown.Item onClick={handleUsers}>Organizations Only</Dropdown.Item>
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
  width: 25%;

  font-size: 1.5rem;
  font-family: Nunito;

  background-color: #1a3185;
  border: 1px solid lightgrey;

  &:active,
  &:focus,
  &:hover {
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
