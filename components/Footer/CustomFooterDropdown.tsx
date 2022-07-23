import React from 'react';
import { NavDropdown, Button} from '../bootstrap';


export type CustomDropdownProps = {
    title:string,
    children?: any,

}

export default function CustomDropdown({title, children }: CustomDropdownProps) {

    return (
        <div style={{borderBottom:"solid 1px rgba(255,255,255,0.75)"}}>
        <NavDropdown title={title} drop='end'>
            <li className='nav-item dropdown'>
                {children}
            </li>
        </NavDropdown>
        </div>
    )
}