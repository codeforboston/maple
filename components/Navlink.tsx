import { useRouter } from "next/router"
import { Nav } from "./bootstrap"
import * as links from "./links"
import { Wrap } from "./links"

export const NavLink: React.FC<React.PropsWithChildren<{
  href?: string
  handleClick?: any
  className?: string
  other?: any
}>> = ({ href, handleClick, className, children, other }) => {
  const router = useRouter()
  return (
    <Wrap href={href ?? router.asPath}>
      <Nav.Link
        active={router.pathname === href}
        onClick={handleClick}
        className={className}
        {...other}
      >
        {children}
      </Nav.Link>
    </Wrap>
  )
}

export const ExternalNavLink: React.FC<React.PropsWithChildren<{
  href: string
  className?: string
}>> = ({ href, children, className }) => {
  return (
    <links.External className={`${className} nav-link`} href={href}>
      {children}
    </links.External>
  )
}
