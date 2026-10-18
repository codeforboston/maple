import ListIcon from "@mui/icons-material/ListAlt"
import LockIcon from "@mui/icons-material/LockOutlined"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { CardLink } from "components/learn/Hub/LearnHub"
import LearnBreadcrumb from "components/learn/LearnBreadcrumb"
import LearnHeader from "components/learn/LearnHeader"
import LearnLayout from "components/learn/LearnLayout"
import { ArrowRightIcon, BotIcon, UsersIcon } from "components/learn/icons"
import { CRIMSON, GREEN, NAVY, ORANGE } from "components/learn/palette"

/** Each policy, its address and its card's colour and icon. "label" is the
 * card's title in the policies translations, or in common for How MAPLE Uses
 * AI, which keeps its About address. */
const POLICIES = [
  {
    policy: "privacy-policy",
    label: "policies:tabs.privacy-policy",
    href: "/policies/privacy",
    color: NAVY,
    Icon: LockIcon
  },
  {
    policy: "copyright",
    label: "policies:tabs.copyright",
    href: "/policies/copyright",
    color: GREEN,
    Icon: ListIcon
  },
  {
    policy: "code-of-conduct",
    label: "policies:tabs.code-of-conduct",
    href: "/policies/code-of-conduct",
    color: ORANGE,
    Icon: UsersIcon
  },
  {
    policy: "maple-ai",
    label: "common:navigation.ai",
    href: "/about/how-maple-uses-ai",
    color: CRIMSON,
    Icon: BotIcon
  }
] as const

/**
 * Digital Democracy and Mixed: /policies as a landing page for the three
 * policies and How MAPLE Uses AI, laid out like the Learn hub
 * (components/learn/Hub/LearnHub.tsx), one card each, two to a row. The Maple skin keeps main's /policies, the privacy policy.
 */
export const PoliciesLanding = () => {
  const { t } = useTranslation(["policies", "common", "learn"])
  return (
    <LearnLayout width="wide">
      <LearnBreadcrumb
        section={t("title")}
        eyebrow={t("about", { ns: "common" })}
      />
      <LearnHeader title={t("title")} />
      <Cards className="row g-4">
        {POLICIES.map(({ policy, label, href, color, Icon }) => (
          <div className="col-12 col-md-6" key={policy}>
            <CardLink href={href}>
              <span className="glyph" style={{ backgroundColor: color }}>
                <Icon aria-hidden="true" sx={{ fontSize: "1.5rem" }} />
              </span>
              <div>
                <h2>{t(label)}</h2>
                <p className="desc">{t(`landing.${policy}`)}</p>
              </div>
              <span className="explore">
                {t("hub.explore", { ns: "learn" })}
                <ArrowRightIcon aria-hidden="true" sx={{ fontSize: "1rem" }} />
              </span>
            </CardLink>
          </div>
        ))}
      </Cards>
    </LearnLayout>
  )
}

/* The hub cards, with less room between the sentence and "Explore": the
   card's 1rem gap stays between the icon and the title only, and Explore sits
   0.5rem under the sentence (still at the foot of the card when its neighbour
   in the row is taller). */
const Cards = styled.div`
  /* Closer under the title: 0.5rem less than the header leaves. The row's
     own negative top margin (Bootstrap's g-4) stays in the sum. */
  && {
    margin-top: calc(-1 * var(--bs-gutter-y) - 0.5rem);
  }

  ${CardLink} {
    gap: 0;
  }

  /* The coloured tile a step smaller than the hub's (3.5rem). */
  ${CardLink} .glyph {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
  }

  ${CardLink} .explore {
    padding-top: 0.5rem;
  }
`
