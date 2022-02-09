import { PropsWithChildren } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

type LinkProps = PropsWithChildren<{ href: string; className?: string }>

export function Internal({ href, children, className }: LinkProps) {
  return (
    <Link href={href}>
      <a className={className}>{children}</a>
    </Link>
  )
}

export function External({
  href,
  children,
  className,
  plain
}: LinkProps & { plain?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children} {!plain && <FontAwesomeIcon icon={faExternalLinkAlt} />}
    </a>
  )
}

export const Wrap: React.FC<{ href: string }> = ({ href, children }) => (
  <Link href={href} passHref>
    {children}
  </Link>
)
