import { useTranslation } from "next-i18next"
import styled from "styled-components"

export const formatPhoneNumber = (value: string) => {
  if (!value) return value

  const phoneNumber = value.replace(/[^\d]/g, "")
  const phoneNumberLength = phoneNumber.length

  // Format as (XXX) XXX-XXXX
  if (phoneNumberLength < 4) return phoneNumber
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  }
  return `
      (${phoneNumber.slice(0, 3)})
       ${phoneNumber.slice(3, 6)}-
       ${phoneNumber.slice(6, 10)}
    `
}

export const TabBlock = styled.div`
  background-color: white;
  border: 1px #b8c0c9 solid;
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 16px;
`

/** Party Labels **/

const DemocraticBubble = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  background: #d1d6e7;
  color: #1a3185;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 10px;
  border-radius: 999px;
  width: max-content;
`

const DistrictBubble = styled.div.attrs(props => ({
  className: `ms-1 ${props.className}`
}))`
  background: #fff3cd;
  color: #856404;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 10px;
  border-radius: 999px;
  width: max-content;
`

const IndependantBubble = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  background: #bca0dc;
  color: #3c1361;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 10px;
  border-radius: 999px;
  width: max-content;
`

const RepublicanBubble = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  background: #f29999;
  color: #de0100;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 10px;
  border-radius: 999px;
  width: max-content;
`

export function DistrictLabel(props: { district: string }) {
  return <DistrictBubble>{props.district}</DistrictBubble>
}

export function PartyLabel(props: { party: string }) {
  const { t } = useTranslation("legislators")

  switch (props.party) {
    case "Democrat":
      return <DemocraticBubble>{t("party.democratic")}</DemocraticBubble>
    case "Republican":
      return <RepublicanBubble>{t("party.republican")}</RepublicanBubble>
    default:
      return (
        <IndependantBubble>
          {props.party} {t("party.party")}
        </IndependantBubble>
      )
  }
}

/** Social Media components **/

export function Bluesky() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-bluesky"
      viewBox="0 0 16 16"
    >
      <path d="M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948" />
    </svg>
  )
}

export function LinkedIn() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-linkedin"
      viewBox="0 0 16 16"
    >
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
    </svg>
  )
}

export function Mastodon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-mastodon"
      viewBox="0 0 16 16"
    >
      <path d="M11.19 12.195c2.016-.24 3.77-1.475 3.99-2.603.348-1.778.32-4.339.32-4.339 0-3.47-2.286-4.488-2.286-4.488C12.062.238 10.083.017 8.027 0h-.05C5.92.017 3.942.238 2.79.765c0 0-2.285 1.017-2.285 4.488l-.002.662c-.004.64-.007 1.35.011 2.091.083 3.394.626 6.74 3.78 7.57 1.454.383 2.703.463 3.709.408 1.823-.1 2.847-.647 2.847-.647l-.06-1.317s-1.303.41-2.767.36c-1.45-.05-2.98-.156-3.215-1.928a4 4 0 0 1-.033-.496s1.424.346 3.228.428c1.103.05 2.137-.064 3.188-.189zm1.613-2.47H11.13v-4.08c0-.859-.364-1.295-1.091-1.295-.804 0-1.207.517-1.207 1.541v2.233H7.168V5.89c0-1.024-.403-1.541-1.207-1.541-.727 0-1.091.436-1.091 1.296v4.079H3.197V5.522q0-1.288.66-2.046c.456-.505 1.052-.764 1.793-.764.856 0 1.504.328 1.933.983L8 4.39l.417-.695c.429-.655 1.077-.983 1.934-.983.74 0 1.336.259 1.791.764q.662.757.661 2.046z" />
    </svg>
  )
}

export function Twitter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a3185">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>
  )
}
