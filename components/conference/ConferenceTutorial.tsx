import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { BackToConferences } from "./BackToConferences"
import { PageColumn, Title } from "./styles"

/** The tutorial video and the still shown before it plays, in public/. */
export const TUTORIAL_VIDEO = "/videos/conference-tutorial.mp4"
export const TUTORIAL_POSTER = "/videos/conference-tutorial-poster.jpg"

/** The page's one column: the video at most 960px wide, and the words over
 * and under it kept to the lead's 720px (ConferenceHero.tsx). */
const Column = styled.div`
  max-width: 960px;
  margin: 0 auto;

  .lead,
  .note,
  .covers {
    max-width: 720px;
  }
  .lead {
    margin: 0.375rem 0 0;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--maple-text-strong);

    @media (min-width: 800px) {
      font-size: 1rem;
    }
  }
  /* The video's length, and that it has no sound to wait for: small and
     muted, as the hero's sources line. */
  .note {
    margin: 0.75rem 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--maple-text-muted);
  }
  .covers {
    margin-top: 2rem;
  }
  h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.35;
    color: var(--maple-text-strong);
  }
  ol {
    margin: 0.75rem 0 0;
    padding-left: 1.25rem;
    display: grid;
    row-gap: 0.5rem;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--maple-text-strong);
  }
`

/** The page's title in Lexend, as the explorer's is (ConferenceExplorer.tsx),
 * which would otherwise take Bootstrap's Nunito. */
const TutorialTitle = styled(Title)`
  *:root & {
    font-family: var(--maple-font-heading);
  }
`

/** The video across the column, held at its 16:9 before it loads so the page
 * under it doesn't jump, with the card's edge and radius. */
const Video = styled.video`
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  margin-top: 1.5rem;
  background: var(--maple-brand-primary-strong);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-xl);
`

/**
 * The tutorial for the conference committee pages: the video, played on the
 * page from MAPLE's own site, and under it what the video covers in words,
 * for a reader who can't watch it. The video has no narration; its captions
 * are part of the picture.
 */
export function ConferenceTutorial() {
  const { t } = useTranslation("conferences")
  const steps = t("tutorial.steps", { returnObjects: true }) as string[]
  return (
    <>
      <BackToConferences />
      <PageColumn>
        <Column>
          <TutorialTitle>{t("tutorial.title")}</TutorialTitle>
          <p className="lead">{t("tutorial.lead")}</p>
          <Video
            controls
            playsInline
            preload="metadata"
            poster={TUTORIAL_POSTER}
            aria-label={t("tutorial.video_label")}
          >
            <source src={TUTORIAL_VIDEO} type="video/mp4" />
            <Trans
              t={t}
              i18nKey="tutorial.unsupported"
              components={{ 1: <a href={TUTORIAL_VIDEO} /> }}
            />
          </Video>
          <p className="note">{t("tutorial.note")}</p>
          <section className="covers" aria-labelledby="tutorial-covers">
            <h2 id="tutorial-covers">{t("tutorial.covers")}</h2>
            <ol>
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        </Column>
      </PageColumn>
    </>
  )
}
