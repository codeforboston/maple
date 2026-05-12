import styled from "styled-components"

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

const IndependantBubble = styled.div.attrs(props => ({
  className: `${props.className}`
}))`
  background: #fff3cd;
  color: #856404;
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

export function PartyLabel(props: { party: string }) {
  switch (props.party) {
    case "Democrat":
      return <DemocraticBubble>Democratic Party</DemocraticBubble>
    case "Republican":
      return <RepublicanBubble>Republican Party</RepublicanBubble>
    default:
      return <IndependantBubble>{props.party} Party</IndependantBubble>
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

export function Twitter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a3185">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>
  )
}
