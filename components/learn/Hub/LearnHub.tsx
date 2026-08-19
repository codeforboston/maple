import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Internal } from "../../links"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"
import {
  ArrowRightIcon,
  BookOpenIcon,
  BotIcon,
  ScaleIcon,
  UsersIcon
} from "../icons"
import { CRIMSON, GREEN, NAVY, ORANGE } from "../palette"

type HubCard = {
  id: string
  title: string
  desc: string
  href: string
}

const CARD_STYLE: Record<string, { color: string; Icon: typeof BookOpenIcon }> =
  {
    testimony: { color: NAVY, Icon: BookOpenIcon },
    process: { color: GREEN, Icon: ScaleIcon },
    why: { color: ORANGE, Icon: UsersIcon },
    ai: { color: CRIMSON, Icon: BotIcon }
  }

const CardLink = styled(Internal)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  padding: 2rem;
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  text-decoration: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: var(--maple-shadow-hover);
    border-color: transparent;
    text-decoration: none;
  }

  &:focus-visible {
    outline: 2px solid var(--bs-blue);
    outline-offset: 3px;
  }

  .glyph {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--maple-radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    font-size: 1.3125rem;
    color: #1a1a2e;
    margin: 0 0 0.5rem;
  }

  .desc {
    color: var(--maple-text-muted);
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0;
  }

  .explore {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--bs-blue);
  }

  .explore svg {
    transition: transform 0.2s ease;
  }

  &:hover .explore svg {
    transform: translateX(4px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    .explore svg {
      transition: none;
      transform: none;
    }
  }
`

export const LearnHub = () => {
  const { t } = useTranslation("learn")
  const cards = t("hub.cards", { returnObjects: true }) as HubCard[]

  return (
    <LearnLayout width="wide">
      <LearnHeader
        eyebrow={t("hub.eyebrow")}
        title={t("hub.title")}
        subhead={t("hub.subhead")}
        titleSize="2.5rem"
        subheadMaxWidth="none"
      />

      <div className="row g-4 mt-1">
        {cards.map(card => {
          const { color, Icon } = CARD_STYLE[card.id]
          return (
            <div className="col-12 col-md-6" key={card.id}>
              <CardLink href={card.href}>
                <span className="glyph" style={{ backgroundColor: color }}>
                  <Icon aria-hidden="true" sx={{ fontSize: "1.75rem" }} />
                </span>
                <div>
                  <h2>{card.title}</h2>
                  <p className="desc">{card.desc}</p>
                </div>
                <span className="explore">
                  {t("hub.explore")}
                  <ArrowRightIcon
                    aria-hidden="true"
                    sx={{ fontSize: "1.125rem" }}
                  />
                </span>
              </CardLink>
            </div>
          )
        })}
      </div>
    </LearnLayout>
  )
}

export default LearnHub
