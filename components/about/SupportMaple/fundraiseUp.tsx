import Script from "next/script"

/* MAPLE takes donations through Partners in Democracy – Education's
   Fundraise Up account, in its "General Donations - MAPLE" campaign. Loading
   Fundraise Up's script here opens that campaign's checkout over this page,
   instead of sending donors to PiD's site. */
export const FUNDRAISE_UP_ACCOUNT = "AHKSJJXT"
export const MAPLE_CAMPAIGN = "FUNMSSLLQEC"

export type Frequency = "once" | "monthly"

type OpenCheckoutOptions = {
  donation: { amount?: number; currency?: string; recurring: Frequency }
}

declare global {
  interface Window {
    FundraiseUp?: {
      openCheckout?: (campaignId: string, options?: OpenCheckoutOptions) => void
    }
  }
}

/* Fundraise Up's installation code, as given in its dashboard (Settings >
   Installation). Loaded on this page only, so its overlays can't appear
   elsewhere on MAPLE. It also opens checkout on arrival when the URL carries
   ?form=FUNMSSLLQEC, so other pages can link here to start a donation. */
/* eslint-disable i18next/no-literal-string -- script source, not UI text */
const INSTALL_CODE = `(function(w,d,s,n,a){if(!w[n]){var l='call,catch,on,once,set,then,track,openCheckout'
.split(','),i,o=function(n){return'function'==typeof n?o.l.push([arguments])&&o
:function(){return o.l.push([n,arguments])&&o}},t=d.getElementsByTagName(s)[0],
j=d.createElement(s);j.async=!0;j.src='https://cdn.fundraiseup.com/widget/'+a+'';
t.parentNode.insertBefore(j,t);o.s=Date.now();o.v=5;o.h=w.location.href;o.l=[];
for(i=0;i<8;i++)o[l[i]]=o(l[i]);w[n]=o}
})(window,document,'script','FundraiseUp','${FUNDRAISE_UP_ACCOUNT}');`

/** The same campaign on PiD's site, for browsers that block Fundraise Up. */
export function fallbackDonateUrl(
  amount: number | undefined,
  recurring: Frequency
) {
  const params = new URLSearchParams({ form: MAPLE_CAMPAIGN, recurring })
  if (amount) params.set("amount", String(amount))
  return `https://partnersindemocracy.us/?${params}`
}
/* eslint-enable i18next/no-literal-string */

/** Opens checkout over the page. Returns false if Fundraise Up isn't loaded. */
export function openCheckout(amount: number | undefined, recurring: Frequency) {
  const open = window.FundraiseUp?.openCheckout
  if (!open) return false
  open(MAPLE_CAMPAIGN, {
    donation: amount ? { amount, currency: "USD", recurring } : { recurring }
  })
  return true
}

export const FundraiseUpScript = () => (
  <Script
    id="fundraiseup"
    strategy="afterInteractive"
    dangerouslySetInnerHTML={{ __html: INSTALL_CODE }}
  />
)
