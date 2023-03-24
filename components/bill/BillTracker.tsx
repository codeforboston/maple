import { Card as MapleCard } from "components/Card/Card"
import { Stage, useBillTracker } from "components/db/useBillStatus"
import styled from "styled-components"
import { BillProps, BillTracker } from "./types"

export default function BillTrackerConnectedView({
  bill,
  className
}: BillProps & { className?: string }) {
  const { result } = useBillTracker(bill.id, bill.court)
  return result ? (
    <BillTrackerView tracker={result} className={className} />
  ) : null
}

const BillTrackerView = ({
  tracker,
  className
}: {
  tracker: BillTracker
  className?: string
}): JSX.Element => {
  const currentStage =
    tracker.label?.status ?? tracker.prediction?.status ?? Stage.billIntroduced

  const body = (
    <BillStatusBody className={className}>
      {Object.values(Stage).map(s => (
        <StyledBillStageStrip key={s} stage={s} currentStage={currentStage} />
      ))}
    </BillStatusBody>
  )
  return <MapleCard header="Bill Tracker" body={body} />
}

export const BillStageStrip = ({
  stage,
  currentStage,
  info,
  className
}: {
  stage: Stage
  currentStage: Stage
  info?: string
  className?: string
}) => {
  const statuses = Object.values(Stage)

  const isCurrentStage =
    statuses.indexOf(stage) === statuses.indexOf(currentStage)
  const isPastStage = statuses.indexOf(stage) < statuses.indexOf(currentStage)

  const color = isCurrentStage
    ? "var(--bs-green)"
    : isPastStage
    ? "#8EBC81"
    : "var(--bs-gray)"

  return (
    <div className={className}>
      <div className="tracker-segment">
        <TrackerDot color={color} />
        {stage !== Stage.signed && <div className="track-line"></div>}
      </div>
      <div className="stage-description">
        <div className="stage-title">{stage}</div>
        <div className="info">{info}</div>
      </div>
    </div>
  )
}

const TrackerDot = ({ color = "var(--bs-gray)" }: { color: string }) => {
  return (
    <div className="stage-radio">
      <svg
        width="23"
        height="23"
        viewBox="0 0 23 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="11.5"
          cy="11.5"
          r="10.7581"
          fill="white"
          stroke={color}
          strokeWidth="1.48387"
        />
        <circle
          cx="11.5006"
          cy="11.5001"
          r="8.19375"
          fill={color}
          stroke={color}
          strokeWidth="0.2875"
        />
      </svg>
    </div>
  )
}

const getRem = (pixelSize: string | number) => {
  let n: number = 0

  if (typeof pixelSize === "string") {
    const matches = pixelSize.match(/(\d+)/)
    if (matches) {
      n = Number(matches[0])
    }
  } else {
    n = pixelSize
  }

  return n / 16 + "rem"
}

const BillStatusBody = styled.div`
  height: ${getRem(364)};
  width: ${getRem(310)};
  padding: 20px 24px 10px 24px;
`
const StyledBillStageStrip = styled(BillStageStrip)`
  height: ${getRem(49)};
  width: ${getRem(244)};
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: ${getRem(8)};

  .stage-description {
    height: ${getRem(49)};
    flex: 1;
  }
  .stage-title {
    font-family: Nunito;
    font-weight: ${props => (props.currentStage ? 700 : 500)};
    line-height: ${getRem(20)};
    letter-spacing: 0.015em;
    text-align: left;
  }
  .info {
    font-family: Nunito;
    font-size: ${getRem(12)};
    font-weight: 600;
    line-height: ${getRem(15)};
    letter-spacing: 0.03em;
    text-align: left;
  }

  .tracker-segment {
    height: ${getRem(49)};
    width: ${getRem(23)};
    flex: 0 1;
  }

  .stage-radio {
  }

  .track-line {
    height: ${getRem(49 - 23 - 4)};
    width: 1px;
    margin: 2px auto;
    background-color: var(--bs-green);
  }
`
