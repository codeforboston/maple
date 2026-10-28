import { ReactNode } from "react"
import styled from "styled-components"

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--maple-surface-border);
  font-size: 1rem;
  line-height: 1.4;

  .lead {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: none;
    font-weight: 600;
  }

  .title {
    flex: 1 1 14rem;
    min-width: 0;
    color: var(--maple-text-body);
  }

  .action {
    flex: none;
    margin-left: auto;
  }

  /* On this page only: every row's Follow button at the compact size (the
     bill's included, which is large on the bill page), and, since everything
     listed here is followed, labelled "Unfollow" with its x from the start
     rather than "Following". Doubled class to win over the site-wide Follow
     rules in styles/globals.css. */
  [data-maple-theme="dd"] && .follow-button .btn {
    --bs-btn-font-size: 0.875rem;
    --bs-btn-font-weight: 500;
    --bs-btn-padding-x: 1rem;
  }

  @media (max-width: 991.98px) {
    [data-maple-theme="dd"] && .follow-button .btn {
      --bs-btn-font-weight: 600;
    }
  }

  [data-maple-theme="dd"] && .follow-label-following {
    display: none;
  }

  [data-maple-theme="dd"] && .follow-label-unfollow {
    display: inline;
  }
`

/**
 * One followed bill, ballot question or person in Edit Profile's Following
 * and Followers tabs, under Digital Democracy, Mixed and Statehouse: what it
 * is (a link, with an icon for a person), its title where it has one, and
 * the Follow button at the end, over a thin divider. Maple keeps main's rows.
 */
export function FollowedItemRow({
  lead,
  title,
  action
}: {
  lead: ReactNode
  title?: ReactNode
  action?: ReactNode
}) {
  return (
    <Row>
      <div className="lead">{lead}</div>
      {title && <div className="title">{title}</div>}
      {action && <div className="action">{action}</div>}
    </Row>
  )
}
