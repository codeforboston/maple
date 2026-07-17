import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Internal } from "../../links"
import LearnBreadcrumb from "../LearnBreadcrumb"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"
import { CheckIcon } from "../icons"
import { NAVY, STAGE_COLORS, alpha } from "../palette"

/* Near-black for headings, a shade deeper than the page's body ink. */
const INK = "#0f1828"

type Tip = { label: string; body: string }
type Item = { title: string; body: string }

/* The About Testimony page is built from blob-headed panels; this one borrows
   the process page's display numerals and coloured spines, so the two pages do
   not read as the same page. */

const Card = styled.section`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;
  margin-bottom: 1rem;
`

/* No fill: the heading sits on the card itself, divided from the list by a rule.
   Any tint here either vanished into the page background or competed with the
   coloured numerals below. */
const Hero = styled.div`
  padding: 2rem 2rem 0;

  /* The rule is drawn inside the padding rather than as a border on the box, so
     the card's gutter shows on both ends of it instead of it running edge to
     edge. Navy, but held well back: at full strength a 1px line across the card
     reads as a table rule rather than a divider. */
  &::after {
    content: "";
    display: block;
    height: 1px;
    margin-top: 1.5rem;
    background: ${alpha(NAVY, 16)};
  }

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 1.25;
    color: ${alpha(INK, 85)};
    margin-bottom: 0.75rem;
  }

  p {
    color: var(--maple-text-body);
    font-size: 1.0625rem;
    line-height: 1.65;
    margin-bottom: 0;
  }

  @media (max-width: 36rem) {
    padding: 1.25rem 1.25rem 0;
  }
`

const Ticks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 2rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
  }

  li + li {
    margin-top: 1.25rem;
  }

  .tick {
    flex-shrink: 0;
    margin-top: 0.125rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--maple-radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${alpha(NAVY, 9)};
    color: ${NAVY};
  }

  .title {
    font-weight: 700;
    color: var(--maple-text-strong);
    line-height: 1.4;
    margin: 0 0 0.25rem;
  }

  .text {
    color: var(--maple-text-muted);
    line-height: 1.6;
    margin: 0;
  }

  @media (max-width: 36rem) {
    padding: 1.5rem 1.25rem;
  }
`

/* The five principles: a display numeral and a coloured spine, cycling the
   Learn section's stage colours the way the process chapters do. */
const Principle = styled.li<{ $color: string }>`
  display: flex;
  align-items: stretch;
  gap: 1.25rem;
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  padding: 1.5rem 1.75rem;

  .num {
    font-family: var(--maple-font-heading);
    font-weight: 900;
    font-size: 2.25rem;
    line-height: 1;
    flex-shrink: 0;
    width: 2.5rem;
    color: ${p => p.$color};
  }

  .spine {
    width: 4px;
    align-self: stretch;
    border-radius: var(--maple-radius-pill);
    flex-shrink: 0;
    background: ${p => alpha(p.$color, 25)};
  }

  .label {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    color: var(--maple-text-strong);
    font-size: 1.125rem;
    line-height: 1.35;
    margin: 0 0 0.375rem;
  }

  .text {
    color: var(--maple-text-muted);
    line-height: 1.6;
    margin: 0;
  }

  @media (max-width: 36rem) {
    gap: 1rem;
    padding: 1.25rem;

    .num {
      font-size: 1.75rem;
      width: 1.75rem;
    }
  }
`

const PrincipleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

/* Sets the gap between the checklist card above and the principles below it. */
const SectionTitle = styled.h2`
  font-family: var(--maple-font-heading);
  font-weight: 700;
  color: ${alpha(INK, 85)};
  font-size: 1.375rem;
  margin: 4rem 0 1rem;
`

const Cta = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  padding: 2.5rem 2rem;
  text-align: center;

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 900;
    color: ${NAVY};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--maple-text-body);
    line-height: 1.65;
    max-width: 34rem;
    margin: 0 auto 1.5rem;
  }

  /* A navy pill, at MAPLE's button height (standard vertical padding). */
  a {
    display: inline-block;
    padding: var(--maple-space-sm) var(--maple-space-xl);
    border-radius: var(--maple-radius-pill);
    background: ${NAVY};
    color: var(--maple-text-inverse);
    font-weight: 700;
    text-decoration: none;

    &:hover {
      background: var(--maple-brand-primary-strong);
      color: var(--maple-text-inverse);
    }
  }
`

export const WritingTips = () => {
  const { t } = useTranslation("learn")

  const tips = t("testimony.tips", { returnObjects: true }) as Tip[]
  const include = t("writingTips.include.items", {
    returnObjects: true
  }) as Item[]

  return (
    <LearnLayout width="medium">
      <LearnBreadcrumb section={t("writingTips.breadcrumb")} />
      <LearnHeader
        title={t("writingTips.title")}
        subhead={t("writingTips.subhead")}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />

      {/* What every letter should include: a hero over a tick list. */}
      <Card>
        <Hero>
          <h2>{t("writingTips.include.headline")}</h2>
          <p>{t("writingTips.include.intro")}</p>
        </Hero>
        <Ticks>
          {include.map(item => (
            <li key={item.title}>
              <span className="tick" aria-hidden="true">
                <CheckIcon fontSize="small" />
              </span>
              <div>
                <p className="title">{item.title}</p>
                <p className="text">{item.body}</p>
              </div>
            </li>
          ))}
        </Ticks>
      </Card>

      {/* The five principles, as numbered chapters. */}
      <SectionTitle>{t("writingTips.principles.headline")}</SectionTitle>
      <PrincipleList>
        {tips.map((tip, i) => (
          // Cycle the stage colours so any number of tips stays coloured, rather
          // than running off the end of the array into undefined.
          <Principle
            key={tip.label}
            $color={STAGE_COLORS[i % STAGE_COLORS.length]}
          >
            <span className="num" aria-hidden="true">
              {i + 1}
            </span>
            <span className="spine" aria-hidden="true" />
            <div>
              <p className="label">{tip.label}</p>
              <p className="text">{tip.body}</p>
            </div>
          </Principle>
        ))}
      </PrincipleList>

      <Cta>
        <h2>{t("writingTips.cta.headline")}</h2>
        <p>{t("writingTips.cta.body")}</p>
        <Internal href="/bills">{t("writingTips.cta.button")}</Internal>
      </Cta>
    </LearnLayout>
  )
}

export default WritingTips
