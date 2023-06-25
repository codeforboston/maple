import { Image } from "react-bootstrap"
import styled from "styled-components"
import { Testimony } from "../db"
import { formatBillId } from "../formatting"
import * as links from "../links"
import { useTranslation } from "next-i18next"
import { CSSProperties } from "react"

export const voteHandPositionStyles: {
  [position in Testimony["position"]]: CSSProperties
} = {
  endorse: {
    transformOrigin: "center",
    transform: "scale(1, -1)"
  },
  neutral: {
    transformOrigin: "center",
    transform: "scale(1, -1) rotate(-70deg)"
  },
  oppose: {}
}

export const VoteHand = ({ position }: { position: Testimony["position"] }) => {
  const { t } = useTranslation("testimony")

  return (
    <Image
      fluid
      style={voteHandPositionStyles[position]}
      alt={t("testimonyCallout.position", { position1: position }) ?? position}
      src="/VoteHand.png"
    />
  )
}

const CalloutBalloon = styled.div`
  height: 8rem;
  width: calt(100% - 6rem);
  margin: 0.5rem;
  color: white;
  font-family: "Nunito";
  position: relative;
  inset: 0;
  display: flex;
  align-items: flex-end;
  pointer-events: visible;

  .background {
    position: absolute;
    inset: 0;
    width: 100%;
    display: flex;
    align-items: flex-end;
  }

  .callout-angle {
    flex: 0 0 3rem;
    height: 3rem;
    clip-path: polygon(-5% 105%, 105% 105%, 105% -5%);
  }

  .balloon {
    flex: 0 0 calc(100% - 3rem);
    width: 100%;
    height: 100%;
    border-radius: 10px 10px 10px 0;
    display: flex;
    border-left: 1px solid inherit;
    align-items: flex-start;
  }

  .foreground {
    position: relative;
    inset: 0;
    height: 100%;
    width: 100%;
    margin-left: 4em;
    display: flex;
  }

  .hand-container {
    flex: 1;
    height: 100%;
    width: 5rem;
    display: grid;
    place-content: center;
  }

  .content-container {
    padding: 1rem;
    flex: 4;
    color: white;
    font-family: "Nunito";
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    z-index: 0; // creates new stacking context so that text is in front of background
  }

  .main-content {
    flex: 1;
    margin-top: auto;
    word-wrap: break-word;
  }

  .footer {
    flex: 0;
    width: 100%;
    margin-top: auto;
    display: flex;
    justify-content: space-between;

    .bill {
      flex: 0;
    }

    .author {
      flex: 0;
      white-space: nowrap;
    }
  }

  .endorse {
    background-color: var(--bs-green);
  }

  .neutral {
    background-color: var(--bs-blue);
  }

  .oppose {
    background-color: var(--bs-red);
  }
`

export const Callout = ({
  position,
  content,
  billId,
  authorDisplayName
}: {
  content: string
  position: Testimony["position"]
  billId: string
  authorDisplayName: string
}) => {
  const { t } = useTranslation("testimony")

  return (
    <CalloutBalloon>
      <div className="background">
        <div className={`callout-angle ${position}`}></div>
        <div className={`balloon ${position}`}></div>
      </div>
      <div className="foreground">
        <div className="hand-container">
          <VoteHand position={position} />
        </div>
        <div className="content-container">
          <div className="main-content">"{trimContent(content, 90)}"</div>
          <div className="footer">
            <div className="bill">
              {t("testimonyCallout.bill")}
              {formatBillId(billId)}
            </div>
            <div className="author">{authorDisplayName}</div>
          </div>
        </div>
      </div>
    </CalloutBalloon>
  )
}

export function trimContent(content: string, length: number) {
  if (content.length > length) {
    let cutLength = length
    while (content[cutLength - 1] !== " " && cutLength > 1) {
      cutLength--
    }
    return content.slice(0, cutLength - 1) + "..."
  }
  return content
}

export default function TestimonyCallout(props: Testimony) {
  const { billId, court } = props

  return (
    <links.Internal
      href={links.maple.bill({ id: billId, court })}
      className="text-decoration-none"
    >
      <Callout {...props}></Callout>
    </links.Internal>
  )
}
