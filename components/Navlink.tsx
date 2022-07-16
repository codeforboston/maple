import { Wrap } from "./links"
import { useRouter } from "next/router"
import { Nav } from "./bootstrap";

export const NavLink: React.FC<{ href: string; handleClick?: any; other?:any }> = ({
    href,
    handleClick,
    children,
    other,
  }) => {
    const router = useRouter()
    return (
      <Wrap href={href}>
        <Nav.Link active={router.pathname === href} onClick={handleClick} {...other}>
          {children}
        </Nav.Link>
      </Wrap>
    )
  }
  
