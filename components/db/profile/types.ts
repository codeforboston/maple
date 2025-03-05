import { Frequency, Role } from "../../auth"
import { OrgCategory } from "../../auth"

export type ProfileMember = {
  district: string
  id: string
  name: string
}

export type ContactInfo = {
  publicEmail: string
  publicPhone?: number
  website?: string
}

export const SOCIAL_NETWORKS = [
  "linkedIn",
  "twitter",
  "instagram",
  "fb",
  "blueSky",
  "mastodon"
] as const

export type SocialLinks = Partial<
  Record<(typeof SOCIAL_NETWORKS)[number], string>
>

export type Profile = {
  topicName: string
  role: Role
  fullName?: string
  email?: string | null
  representative?: ProfileMember
  senator?: ProfileMember
  public?: boolean
  notificationFrequency?: Frequency
  nextDigestAt?: FirebaseFirestore.Timestamp
  about?: string
  social?: SocialLinks
  profileImage?: string
  billsFollowing?: string[]
  contactInfo?: ContactInfo
  location?: string
  orgCategories?: OrgCategory[] | ""
}
