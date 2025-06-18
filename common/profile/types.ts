import {
  Boolean,
  Dictionary,
  Optional,
  Array,
  Record,
  Static,
  String,
  Null,
  Number,
  InstanceOf
} from "runtypes"
import { Frequency, OrgCategory, Role } from "../auth/types"
import { Timestamp } from "../types"

export const ProfileMember = Record({
  district: String,
  id: String,
  name: String
})
export type ProfileMember = Static<typeof ProfileMember>

export const ContactInfo = Record({
  publicEmail: String,
  publicPhone: Optional(Number),
  website: Optional(String)
})
export type ContactInfo = Static<typeof ContactInfo>

export const SocialLinks = Record({
  linkedIn: String,
  twitter: String,
  instagram: String,
  fb: String,
  blueSky: String,
  mastodon: String
}).asPartial()

export type SocialLinks = Static<typeof SocialLinks>

export const Profile = Record({
  topicName: String,
  role: Role,
  fullName: Optional(String),
  email: Optional(String.Or(Null)),
  representative: Optional(ProfileMember),
  senator: Optional(ProfileMember),
  public: Optional(Boolean),
  notificationFrequency: Optional(Frequency),
  nextDigestAt: Optional(InstanceOf(Timestamp)),
  about: Optional(String),
  social: Optional(Dictionary(String)),
  profileImage: Optional(String),
  billsFollowing: Optional(Array(String)),
  contactInfo: Optional(ContactInfo),
  organization: Optional(Boolean),
  location: Optional(String),
  orgCategories: Optional(Array(OrgCategory))
})

export type Profile = Static<typeof Profile>
