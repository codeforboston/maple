import React from "react"
import { useRouter } from "next/router"
import { Nav } from "./bootstrap"
import { Wrap } from "./links"

const NavLink: React.FC<{ href: string; handleClick?: any; other?: any }> = ({
  href,
  handleClick,
  children,
  other
}) => {
  const router = useRouter()
  return (
    <Wrap href={href}>
      <Nav.Link
        {...other}
        onClick={handleClick}
        active={router.pathname === href}
      >
        {children}
      </Nav.Link>
    </Wrap>
  )
}

export default NavLink
