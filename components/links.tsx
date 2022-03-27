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

/**
 * Returns the full URL for the given path in the site.
 *
 * @example
 *
 * siteUrl('bill?id=H1000') === "https://digital-testimony-dev.web.app/bill?id=H1000"
 */
export function siteUrl(path?: string) {
  const base = typeof location === "undefined" ? "" : location.origin
  return path ? new URL(path, base).href : base
}
