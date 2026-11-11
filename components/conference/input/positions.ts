import { ConferencePosition } from "components/db"

/** In the order the mockup offers them: wanting a result leads, the refusal,
 * which ends the process, is last. */
export const conferencePositions: ConferencePosition[] = [
  "passSomething",
  "passSenateVersion",
  "passHouseVersion",
  "passNothing"
]

type Colours = {
  /** The chip on a card. */
  chipBg: string
  chipInk: string
  /** The chosen option in the panel. */
  onBg: string
  onBorder: string
  onInk: string
}

/** The mockup's positions.ts colours, from theme.css. */
export const positionColours: Record<ConferencePosition, Colours> = {
  passSomething: {
    chipBg: "#e0f2d5",
    chipInk: "#2c5a2d",
    onBg: "#e0f2d5",
    onBorder: "#76c353",
    onInk: "#2e7d32"
  },
  passHouseVersion: {
    chipBg: "#faeec5",
    chipInk: "#8a5a00",
    onBg: "#faeec5",
    onBorder: "#ecb72e",
    onInk: "#8a5a00"
  },
  passSenateVersion: {
    chipBg: "#d6e4f6",
    chipInk: "#2c5593",
    onBg: "#d6e4f6",
    onBorder: "#4682d5",
    onInk: "#2a6fd5"
  },
  passNothing: {
    chipBg: "#f7dcdc",
    chipInk: "#7d2f2c",
    onBg: "#f7dcdc",
    onBorder: "#b53333",
    onInk: "#b53333"
  }
}
