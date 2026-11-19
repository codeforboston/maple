import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { Trans, useTranslation } from "next-i18next"
import { MouseEvent, useState } from "react"
import styled from "styled-components"
import {
  fallbackDonateUrl,
  Frequency,
  FundraiseUpScript,
  openCheckout
} from "./fundraiseUp"

/* Suggested amounts in dollars. "Other" opens checkout with no amount set,
   so the donor types their own. */
const AMOUNTS: Record<Frequency, number[]> = {
  once: [25, 50, 100, 250, 500],
  monthly: [10, 25, 50, 100, 500]
}
const FREQUENCIES: Frequency[] = ["once", "monthly"]
const OTHER = -1

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
})

const Box = styled.div`
  flex: 1 1 18rem;
  max-width: 25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-card-edge);
  border-radius: 1rem;

  button {
    font: inherit;
    font-weight: 700;
    cursor: pointer;

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 0.25rem var(--maple-focus-ring);
    }
  }

  .frequency {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.25rem;
    padding: 0.25rem;
    background: var(--maple-color-gray-subtle-bg);
    border-radius: var(--maple-radius-md);

    button {
      height: 2.5rem;
      border: 0;
      border-radius: calc(var(--maple-radius-md) - 2px);
      background: transparent;
      color: var(--maple-color-gray-subtle-text);

      &[aria-pressed="true"] {
        background: var(--maple-surface-base);
        color: var(--maple-text-strong);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.14);
      }
    }
  }

  .amounts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;

    button {
      height: 3rem;
      border: 1px solid var(--maple-border-default);
      border-radius: var(--maple-radius-md);
      background: var(--maple-surface-base);
      color: var(--maple-brand-primary);

      &[aria-pressed="true"] {
        background: var(--maple-brand-primary);
        border-color: var(--maple-brand-primary);
        color: var(--maple-text-inverse);
      }
    }
  }

  .donate {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 3.25rem;
    font-size: 1.125rem;
  }

  .fine-print {
    display: flex;
    gap: 0.5rem;
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--maple-text-muted);

    svg {
      flex: none;
      margin-top: 0.125rem;
      font-size: 1rem;
    }

    a {
      color: inherit;
      text-decoration: underline;
    }
  }
`

const GiveBox = () => {
  const { t } = useTranslation("supportmaple")
  const [frequency, setFrequency] = useState<Frequency>("once")
  const [selected, setSelected] = useState(1)

  const amounts = AMOUNTS[frequency]
  const amount = selected === OTHER ? undefined : amounts[selected]
  const fallbackUrl = fallbackDonateUrl(amount, frequency)

  let cta: string
  if (amount === undefined) {
    cta = t(
      frequency === "monthly" ? "donate.ctaOtherMonthly" : "donate.ctaOther"
    )
  } else {
    cta = t(frequency === "monthly" ? "donate.ctaMonthly" : "donate.cta", {
      amount: usd.format(amount)
    })
  }

  // Open checkout over the page; if Fundraise Up isn't loaded, follow the
  // link to the same campaign on PiD's site.
  const donate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (openCheckout(amount, frequency)) event.preventDefault()
  }

  return (
    <Box>
      <FundraiseUpScript />
      <div
        role="group"
        aria-label={t("donate.frequency")}
        className="frequency"
      >
        {FREQUENCIES.map(f => (
          <button
            key={f}
            type="button"
            aria-pressed={frequency === f}
            onClick={() => setFrequency(f)}
          >
            {t(`donate.${f}`)}
          </button>
        ))}
      </div>
      <div role="group" aria-label={t("donate.amount")} className="amounts">
        {amounts.map((value, i) => (
          <button
            key={value}
            type="button"
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            {usd.format(value)}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={selected === OTHER}
          onClick={() => setSelected(OTHER)}
        >
          {t("donate.other")}
        </button>
      </div>
      <a href={fallbackUrl} onClick={donate} className="btn btn-primary donate">
        {cta}
      </a>
      <p className="fine-print">
        <LockOutlinedIcon aria-hidden="true" />
        <span>{t("donate.finePrint")}</span>
      </p>
      <p className="fine-print">
        <span>
          <Trans
            t={t}
            i18nKey="donate.fallback"
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            components={[<a href={fallbackUrl} key="fallback" />]}
          />
        </span>
      </p>
    </Box>
  )
}

export default GiveBox
