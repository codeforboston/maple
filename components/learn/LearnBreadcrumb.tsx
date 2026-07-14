import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ChevronRightIcon } from "./icons"

const Nav = styled.nav`
  margin-bottom: 1rem;

  ol {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 0.875rem;
  }

  a {
    /* --maple-text-muted fails AA on the tinted Learn surface. */
    color: var(--maple-text-body);
    text-decoration: none;

    &:hover {
      color: var(--bs-blue);
      text-decoration: underline;
    }
  }

  .separator {
    color: var(--maple-text-muted);
    font-size: 1rem;
  }

  /* Reads like the other crumbs, but not a link. */
  .disabled {
    color: var(--maple-text-body);
  }

  .current {
    color: var(--bs-blue);
    font-weight: 700;
  }
`

/** "Learn > {section}" trail shown at the top of each Learn sub-page. */
export const LearnBreadcrumb = ({ section }: { section: string }) => {
  const { t } = useTranslation("learn")

  return (
    <Nav aria-label={t("breadcrumbLabel")}>
      <ol>
        {/* The Learn hub link is disabled for now -- the hub page still exists,
            we just are not surfacing it yet. Restore the <Internal href="/learn">
            wrapper (and its import) to re-enable it. */}
        <li>
          <span className="disabled">{t("hub.eyebrow")}</span>
        </li>
        <li aria-hidden="true" className="separator d-flex align-items-center">
          <ChevronRightIcon fontSize="inherit" />
        </li>
        <li className="current" aria-current="page">
          {section}
        </li>
      </ol>
    </Nav>
  )
}

export default LearnBreadcrumb
