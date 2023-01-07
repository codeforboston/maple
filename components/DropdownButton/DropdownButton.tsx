import React from "react"
import Dropdown from "react-bootstrap/Dropdown"
import styles from "./dropdownbutton.module.css"



export type DropdownButtonProps = {
  title: string
  children?: any
}

export default function DropdownButton({
  title,
  children
}: 
DropdownButtonProps) {
    return (
        <Dropdown >
          <Dropdown.Toggle className={styles.dropdown}
              variant="outline-secondary"
              id="dropdown-basic">
            Last 6 Weeks
          </Dropdown.Toggle>
    
          <Dropdown.Menu className={styles.dropdown}>
            
            <Dropdown.Item href="#/action-1" className = {styles.item}>Action</Dropdown.Item>
            <Dropdown.Item href="#/action-2" className = {styles.item}>Another action</Dropdown.Item>
            <Dropdown.Item href="#/action-3" className = {styles.item}>Something else</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
  
}
