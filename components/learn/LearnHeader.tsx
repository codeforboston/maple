import styled from "styled-components"

const Eyebrow = styled.p`
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  /* 50% failed AA against the tinted Learn surface. */
  color: color-mix(in srgb, var(--bs-blue) 78%, transparent);
  margin-bottom: 0.5rem;
`

const Title = styled.h1`
  font-family: var(--maple-font-heading);
  font-weight: 700;
  color: var(--bs-blue);
  line-height: 1.15;
  margin-bottom: 0.75rem;
  /* Scale down on narrow viewports rather than wrapping to four lines. */
  font-size: clamp(1.75rem, 6vw, var(--learn-title-size, 2.375rem));
`

const Subhead = styled.p`
  color: var(--maple-text-body);
  max-width: var(--learn-subhead-max-width, 34rem);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0;
`

/**
 * Eyebrow + display heading + subhead, shared by the Learn hub and its
 * sub-pages. `eyebrow` is omitted on sub-pages, which show a breadcrumb instead.
 *
 * `subheadMaxWidth` defaults to a readable measure. Pass "none" to let the
 * subhead run the full width of the page column.
 */
export const LearnHeader = ({
  eyebrow,
  title,
  subhead,
  titleSize = "2.375rem",
  subheadMaxWidth
}: {
  eyebrow?: string
  title: React.ReactNode
  subhead?: React.ReactNode
  titleSize?: string
  subheadMaxWidth?: string
}) => (
  <header className="mb-4">
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <Title style={{ "--learn-title-size": titleSize } as React.CSSProperties}>
      {title}
    </Title>
    {subhead && (
      <Subhead
        style={
          subheadMaxWidth
            ? ({
                "--learn-subhead-max-width": subheadMaxWidth
              } as React.CSSProperties)
            : undefined
        }
      >
        {subhead}
      </Subhead>
    )}
  </header>
)

export default LearnHeader
