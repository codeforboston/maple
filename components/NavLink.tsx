import React from 'react';
import { useRouter } from "next/router";
import { Nav } from "./bootstrap"
import { Wrap } from "./links";

const NavLink: React.FC<{ href: string;}> = ({ href, children }) => {
    const router = useRouter()
    return (
      <Wrap href={href}>
        <Nav.Link 
          active={router.pathname === href}>{children}</Nav.Link>
      </Wrap>
    )
  }

  export default NavLink;