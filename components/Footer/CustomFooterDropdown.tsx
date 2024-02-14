import React from "react"
import { NavDropdown, Button } from "../bootstrap"

export type CustomDropdownProps = {
  title: string
  children?: any
}

export default function CustomDropdown({
  title,
  children
}: CustomDropdownProps) {
  return (
    <div className={`border-bottom border-white border-opacity-75`}>
      <NavDropdown title={title} drop="end">
        <li className="nav-item dropdown">{children}</li>
      </NavDropdown>
    </div>
  )
}
