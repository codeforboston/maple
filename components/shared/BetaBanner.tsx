import React from "react"
import { useTranslation } from "next-i18next"
import { BetaTag } from "./CommonComponents"
import { SlimBanner } from "./StyledSharedComponents"
import { CopyEmail } from "./CopyEmail"
import styled from "styled-components"

/** The header's BETA tag before the words, a size up from its 10px to sit
 * with the note's words: the navbar's line height, and its space on the right
 * rather than its left (Note's .beta-tag). */
const betaStyle: React.CSSProperties = {
  flex: "none",
  fontSize: "12px",
  lineHeight: 1.5,
  padding: "0.125rem 0.5rem",
  marginLeft: 0
}

/** The tag in a column of its own, centred down the words beside it, so
 * where they wrap (a phone) they wrap beside it rather than under it, read
 * from the left; on one line, the two centred across the note together. */
const Note = styled(SlimBanner)<{ $tagOnly: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  .beta-tag {
    margin-right: 0.5rem;
  }
  .words {
    min-width: 0;
    text-align: left;
  }

  /* A size down on a phone, from the note's 0.9375rem, so it wraps onto
     fewer lines while it holds at the top of the screen. */
  @media (max-width: 767.98px) {
    font-size: 0.875rem;
  }

  /* With tagOnlyOnMobile, the tag alone on a phone, centred. */
  ${({ $tagOnly }) =>
    $tagOnly
      ? `@media (max-width: 767.98px) {
          .words {
            display: none;
          }
          .beta-tag {
            margin-right: 0;
          }
        }`
      : ""}
`

/**
 * The beta note across the top of a section still in beta (the lobbying
 * explorer, a conference committee's page): the slim orange note
 * (SlimBanner), the BETA tag, what is in beta, and where to send feedback.
 */
export function BetaBanner({
  children,
  className,
  tagOnlyOnMobile = false
}: {
  children: React.ReactNode
  className?: string
  /** On a phone, the BETA tag alone, without the words or the email. */
  tagOnlyOnMobile?: boolean
}) {
  const { t } = useTranslation("common")
  return (
    <Note className={className} $tagOnly={tagOnlyOnMobile}>
      <BetaTag className="beta-tag" style={betaStyle}>
        {t("beta_feature")}
      </BetaTag>
      <span className="words">
        {children} <CopyEmail />
      </span>
    </Note>
  )
}
