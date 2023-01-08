import React from "react"
import Dropdown from "react-bootstrap/Dropdown"
import styles from "./dropdownbutton.module.css"



export type DropdownButtonProps = {
  title: string
  children?: Array<string>
}

export default function DropdownButton({
  title,
  children
}: 
DropdownButtonProps) {

    const childElement = children.map((item,i) => (<Dropdown.Item href={item[1]} key={i} className = {styles.item}>{item[0]}</Dropdown.Item>))
    return (
        <Dropdown >
          <Dropdown.Toggle className={styles.dropdown}
              variant="outline-secondary"
              id="dropdown-basic">
            {title}
          </Dropdown.Toggle>
    
          <Dropdown.Menu className={styles.dropdown}>
            {childElement}
          </Dropdown.Menu>
        </Dropdown>
      );
  
}
