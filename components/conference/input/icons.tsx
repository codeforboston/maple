import { ReactNode } from "react"

/** The mockup's line icons (Lucide, ISC), drawn at its sizes. */
function Icon({ size = 16, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      {children}
    </svg>
  )
}

type Props = { size?: number }

export const Megaphone = (p: Props) => (
  <Icon {...p}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </Icon>
)
export const Lectern = (p: Props) => (
  <Icon {...p}>
    <path d="M16 12h3a2 2 0 0 0 1.902-1.38l1.056-3.333A1 1 0 0 0 21 6H3a1 1 0 0 0-.958 1.287l1.056 3.334A2 2 0 0 0 5 12h3" />
    <path d="M18 6V3a1 1 0 0 0-1-1h-3" />
    <rect width="8" height="12" x="8" y="10" rx="1" />
  </Icon>
)
export const UserRound = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </Icon>
)
export const Users = (p: Props) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
)
export const ChevronDown = (p: Props) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)
export const ChevronLeft = (p: Props) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)
export const ChevronRight = (p: Props) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
)
export const ListFilter = (p: Props) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </Icon>
)
export const EllipsisVertical = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </Icon>
)
export const X = (p: Props) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
)
export const Plus = (p: Props) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
)
export const FileText = (p: Props) => (
  <Icon {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </Icon>
)
export const Flag = (p: Props) => (
  <Icon {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" x2="4" y1="22" y2="15" />
  </Icon>
)
export const BellPlus = (p: Props) => (
  <Icon {...p}>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M15 8h6" />
    <path d="M18 5v6" />
    <path d="M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332" />
  </Icon>
)
export const Check = (p: Props) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)
export const SquarePen = (p: Props) => (
  <Icon {...p}>
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
  </Icon>
)
