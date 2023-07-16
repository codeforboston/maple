import {
  Boolean,
  Dictionary,
  Optional,
  Array,
  Record,
  Static,
  String,
  Null
} from "runtypes"
import { Role } from "../auth/types"

export const ProfileMember = Record({
  district: String,
  id: String,
  name: String
})
export type ProfileMember = Static<typeof ProfileMember>

export const Profile = Record({
  fullName: Optional(String),
  role: Optional(Role),
  representative: Optional(ProfileMember),
  senator: Optional(ProfileMember),
  public: Optional(Boolean),
  about: Optional(String),
  social: Optional(Dictionary(String)),
  organization: Optional(Boolean),
  orgCategories: Optional(Array(String.Or(Null)))
})
export type Profile = Static<typeof Profile>
