import React from "react"
import Dropdown from "react-bootstrap/Dropdown"
import styles from "./dropdownbutton.module.css"

export type DropdownButtonProps = {
  title?: string
  children: Array<string>
}

export default function DropdownButton({
  title,
  children
}: DropdownButtonProps) {
  const [value, setValue] = React.useState(title ? title : children[0][0])

  const handleSelect = (e: React.SetStateAction<any>) => {
    console.log(e)
    setValue(e)
  }

  const childElement = children.map((item, i) => (
    <Dropdown.Item eventKey={item[1]} key={i} className={styles.item}>
      {item[0]}
    </Dropdown.Item>
  ))
  return (
    <Dropdown onSelect={handleSelect}>
      <Dropdown.Toggle
        className={styles.dropdown}
        variant="outline-secondary"
        id="dropdown-basic"
      >
        {value}
      </Dropdown.Toggle>

      <Dropdown.Menu className={styles.dropdown}>{childElement}</Dropdown.Menu>
    </Dropdown>
  )
}
