export type LegislativeSession = {
  Name: string
  Number: number
  FirstYear: number
  SecondYear: number
}

export const legislativeSessions: Record<
  number,
  LegislativeSession | undefined
> = {
  194: {
    Name: "194th (Current)",
    Number: 194,
    FirstYear: 2025,
    SecondYear: 2026
  },
  193: {
    Name: "193rd (2023 - 2024)",
    Number: 193,
    FirstYear: 2023,
    SecondYear: 2024
  },
  192: {
    Name: "192nd (2021 - 2022)",
    Number: 192,
    FirstYear: 2021,
    SecondYear: 2022
  }
}

export const supportedLegislativeSessions = Object.keys(legislativeSessions)
  .map(n => Number.parseInt(n))
  .sort()
  .reverse()

export const currentLegislativeSession = supportedLegislativeSessions[0]

export const isCurrentSession = (courtSession: number) =>
  courtSession === currentLegislativeSession
