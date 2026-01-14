export type CourtSession = {
  number: number
  firstYear: number
  secondYear: number
  label: string
  isCurrent?: boolean
}

const rawSessions: CourtSession[] = [
  {
    number: 194,
    firstYear: 2025,
    secondYear: 2026,
    label: "194th (Current)",
    isCurrent: true
  },
  {
    number: 193,
    firstYear: 2023,
    secondYear: 2024,
    label: "193rd (2023 - 2024)"
  },
  {
    number: 192,
    firstYear: 2021,
    secondYear: 2022,
    label: "192nd (2021 - 2022)"
  }
]

export const COURT_SESSIONS: CourtSession[] = rawSessions.sort(
  (a, b) => b.number - a.number
)

export const COURT_BY_NUMBER: Record<number, CourtSession | undefined> =
  COURT_SESSIONS.reduce<Record<number, CourtSession | undefined>>(
    (acc, session) => {
      acc[session.number] = session
      return acc
    },
    {}
  )

export const CURRENT_COURT_NUMBER =
  COURT_SESSIONS.find(session => session.isCurrent)?.number ??
  COURT_SESSIONS[0]?.number ??
  0

const ordinalSuffix = (value: number) => {
  const mod100 = value % 100
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`
  switch (value % 10) {
    case 1:
      return `${value}st`
    case 2:
      return `${value}nd`
    case 3:
      return `${value}rd`
    default:
      return `${value}th`
  }
}

export const formatCourtFilterLabel = (number: number) => {
  const session = COURT_BY_NUMBER[number]
  if (!session) return String(number)
  if (session.label) return session.label
  if (session.isCurrent)
    return `${ordinalSuffix(number)} (Current ${session.firstYear} - ${
      session.secondYear
    })`
  return `${ordinalSuffix(number)} (${session.firstYear} - ${
    session.secondYear
  })`
}

export const formatCourtSubtitle = (number: number) => {
  const session = COURT_BY_NUMBER[number]
  if (!session) return `${ordinalSuffix(number)} Session`
  const range = `${session.firstYear} - ${session.secondYear}`
  if (session.isCurrent) {
    return `Current Session: ${range}`
  }
  return `${ordinalSuffix(number)} Session: ${range}`
}

export const getCourtSession = (number: number) => COURT_BY_NUMBER[number]
