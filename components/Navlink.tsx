import { useRouter } from "next/router"
import { Nav } from "./bootstrap"
import * as links from "./links"
import { Wrap } from "./links"

export const NavLink: React.FC<{
  href: string
  handleClick?: any
  other?: any
}> = ({ href, handleClick, children, other }) => {
  const router = useRouter()
  return (
    <Wrap href={href}>
      <Nav.Link
        active={router.pathname === href}
        onClick={handleClick}
        {...other}
      >
        {children}
      </Nav.Link>
    </Wrap>
  )
}

export const ExternalNavLink: React.FC<{
  href: string
  className?: string
}> = ({ href, children, className }) => {
  return (
    <links.External className={`${className} nav-link`} href={href}>
      {children}
    </links.External>
  )
}
