import type { Position } from "../db"

export const positionActions: Record<Position, string> = {
  neutral: "am neutral on",
  endorse: "endorse",
  oppose: "oppose"
}

export const positionLabels: Record<Position, string> = {
  neutral: "Neutral",
  endorse: "Endorse",
  oppose: "Oppose"
}

export const calloutLabels = {
  houseChair: "Committee House Chair",
  senateChair: "Committee Senate Chair",
  yourRepresentative: "Your Representative",
  yourSenator: "Your Senator"
}
