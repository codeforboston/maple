import { Profile } from "components/db/profile/types"

export const mockProfile: Profile = {
  topicName: "Environment, Education",
  role: "user",
  fullName: "Sol R. Panels",
  email: "iveseenthelight@example.com",
  representative: {
    id: "rep-123",
    name: "Polly Tician",
    district: "5th Middlesex"
  },
  senator: {
    id: "sen-123",
    name: "Phil E. Buster",
    district: "Middlesex and Suffolk"
  },
  public: true,
  about: "Environmental advocate based in Cambridge, MA.",
  location: "Cambridge, MA",
  phoneVerified: false
}

export function usePublicProfile(_uid?: string, _verifyisorg?: boolean) {
  return {
    result: mockProfile,
    loading: false,
    error: undefined,
    execute: async () => mockProfile,
    currentPromise: null,
    currentParams: null,
    status: "success" as const
  }
}

const noop = async () => {}

export function useProfile() {
  return {
    loading: false,
    profile: mockProfile,
    updatingRep: false,
    updatingSenator: false,
    updatingIsPublic: false,
    updatingNotification: false,
    updatingIsOrganization: false,
    updatingAbout: false,
    updatingFullName: false,
    updatingProfileImage: false,
    updatingOrgCategory: false,
    updatingBillsFollowing: false,
    updatingContactInfo: { publicEmail: false, publicPhone: false, website: false },
    updatingSocial: {
      linkedIn: false,
      twitter: false,
      instagram: false,
      fb: false,
      blueSky: false,
      mastodon: false
    },
    updateSenator: noop,
    updateRep: noop,
    updateIsPublic: noop,
    updateNotification: noop,
    updateIsOrganization: noop,
    updateAbout: noop,
    updateFullName: noop,
    updateProfileImage: noop,
    updateSocial: noop,
    updateContactInfo: noop,
    updateOrgCategory: noop,
    updateBillsFollowing: noop
  }
}

export type ProfileHook = ReturnType<typeof useProfile>

export function useUser() {}

export const profileRef = (_uid: string) => ({} as any)
export const profileImageRef = (_uid: string) => ({} as any)
export const profileImageUrl = async (_uid: string) => ""
export const updateProfileImage = noop
export const setProfile = noop
export const getProfile = async (_uid: string) => mockProfile
