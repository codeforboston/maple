import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Internal } from "../links"
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

  /* Home leads the trail under Digital Democracy and Mixed only. */
  .home-step {
    display: none;
  }

  /* Digital Democracy and Mixed: Lexend, and colour by role: links in the
     link blue, everything else (plain steps and the current page) in the
     same grey; all of it medium (500). */
  [data-maple-theme="dd"] & {
    font-family: var(--maple-font-heading);

    /* A step smaller than Maple's 0.875rem: Lexend runs wider than Nunito. */
    ol {
      font-size: 0.8125rem;
    }

    .home-step {
      display: flex;
    }

    a {
      color: var(--bs-blue);
      font-weight: 500;
    }

    .disabled,
    .current {
      color: var(--maple-text-body);
      font-weight: 500;
    }
  }
`

/**
 * "{eyebrow} > {section}" trail shown at the top of a Learn or About sub-page.
 * The eyebrow defaults to "Learn"; pass one (e.g. "About") to reuse the trail on
 * other sections. parent adds a step between them, for a page a level further
 * down ("About > Policies > Privacy Policy"), linked when it has an href. Under
 * Digital Democracy and Mixed the trail starts with Home.
 */
export const LearnBreadcrumb = ({
  section,
  eyebrow,
  parent
}: {
  section: string
  eyebrow?: string
  /** The middle step; plain text when it has no href. */
  parent?: { label: string; href?: string }
}) => {
  const { t } = useTranslation(["learn", "common"])

  return (
    <Nav aria-label={t("breadcrumbLabel")}>
      <ol>
        <li className="home-step">
          <Internal href="/">{t("navigation.home", { ns: "common" })}</Internal>
        </li>
        <li
          aria-hidden="true"
          className="separator home-step align-items-center"
        >
          <ChevronRightIcon fontSize="inherit" />
        </li>
        {/* The parent link is disabled for now -- the hub pages still exist, we
            just are not surfacing them yet. Restore the <Internal> wrapper (and
            its import) to re-enable it. */}
        <li>
          <span className="disabled">{eyebrow ?? t("hub.eyebrow")}</span>
        </li>
        <li aria-hidden="true" className="separator d-flex align-items-center">
          <ChevronRightIcon fontSize="inherit" />
        </li>
        {parent && (
          <>
            <li>
              {parent.href ? (
                <Internal href={parent.href}>{parent.label}</Internal>
              ) : (
                <span className="disabled">{parent.label}</span>
              )}
            </li>
            <li
              aria-hidden="true"
              className="separator d-flex align-items-center"
            >
              <ChevronRightIcon fontSize="inherit" />
            </li>
          </>
        )}
        <li className="current" aria-current="page">
          {section}
        </li>
      </ol>
    </Nav>
  )
}

export default LearnBreadcrumb
