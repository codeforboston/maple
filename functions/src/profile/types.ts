import { Boolean, Dictionary, Optional, Record, Static, String } from "runtypes"
import { Role } from "../auth/types"

export const ProfileMember = Record({
  district: String,
  id: String,
  name: String
})
export type ProfileMember = Static<typeof ProfileMember>

export const Profile = Record({
  displayName: Optional(String),
  role: Optional(Role),
  representative: Optional(ProfileMember),
  senator: Optional(ProfileMember),
  public: Optional(Boolean),
  about: Optional(String),
  social: Optional(Dictionary(String)),
  organization: Optional(Boolean)
})
export type Profile = Static<typeof Profile>
