import { deleteField, doc, getDoc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { useMemo, useReducer } from "react"
import { useAsync } from "react-async-hook"
import { Frequency, OrgCategory, useAuth } from "../../auth"
import { firestore, storage } from "../../firebase"
import { useProfileState } from "./redux"
import { Profile, ProfileMember, SocialLinks, ContactInfo } from "./types"
import { cleanSocialLinks, cleanOrgURL } from "./urlCleanup"

export type ProfileHook = ReturnType<typeof useProfile>

type ProfileState = {
  loading: boolean
  updatingRep: boolean
  updatingSenator: boolean
  updatingIsPublic: boolean
  updatingNotification: boolean
  updatingIsOrganization: boolean
  updatingAbout: boolean
  updatingOrgCategory: boolean
  updatingDisplayName: boolean
  updatingFullName: boolean
  updatingContactInfo: Record<keyof ContactInfo, boolean>
  updatingProfileImage: boolean
  updatingSocial: Record<keyof SocialLinks, boolean>
  updatingBillsFollowing: boolean
  profile: Profile | undefined
}

export const profileRef = (uid: string) => doc(firestore, `/profiles/${uid}`)

export function useProfile() {
  const { user } = useAuth()
  const { loading, profile } = useProfileState(),
    uid = user?.uid,
    [state, dispatch] = useReducer(
      (state: ProfileState, action: Partial<ProfileState>) => ({
        ...state,
        ...action
      }),
      {
        loading: true,
        updatingRep: false,
        updatingSenator: false,
        updatingIsPublic: false,
        updatingNotification: false,
        updatingIsOrganization: false,
        updatingAbout: false,
        updatingDisplayName: false,
        updatingFullName: false,
        updatingProfileImage: false,
        updatingOrgCategory: false,
        updatingContactInfo: {
          publicEmail: false,
          publicPhone: false,
          website: false
        },
        updatingSocial: {
          linkedIn: false,
          twitter: false,
          instagram: false,
          fb: false
        },
        updatingBillsFollowing: false,
        profile
      }
    )

  const callbacks = useMemo(
    () => ({
      updateSenator: async (senator: ProfileMember | null) => {
        if (uid) {
          dispatch({ updatingSenator: true })
          await updateSenator(uid, senator)
          dispatch({ updatingSenator: false })
        }
      },
      updateRep: async (rep: ProfileMember | null) => {
        if (uid) {
          dispatch({ updatingRep: true })
          await updateRepresentative(uid, rep)
          dispatch({ updatingRep: false })
        }
      },
      updateIsPublic: async (isPublic: boolean) => {
        if (uid) {
          dispatch({ updatingIsPublic: true })
          await updateIsPublic(uid, isPublic)
          dispatch({ updatingIsPublic: false })
        }
      },
      updateNotification: async (notificationFrequency: Frequency) => {
        if (uid) {
          dispatch({ updatingNotification: true })
          await updateNotification(uid, notificationFrequency)
          dispatch({ updatingNotification: false })
        }
      },
      updateIsOrganization: async (isOrganization: boolean) => {
        if (uid) {
          dispatch({ updatingIsOrganization: true })
          await updateIsOrganization(uid, isOrganization)
          dispatch({ updatingIsOrganization: false })
        }
      },
      updateAbout: async (about: string) => {
        if (uid) {
          dispatch({ updatingAbout: true })
          await updateAbout(uid, about)
          dispatch({ updatingAbout: false })
        }
      },
      updateDisplayName: async (displayName: string) => {
        if (uid) {
          dispatch({ updatingDisplayName: true })
          await updateDisplayName(uid, displayName)
          dispatch({ updatingDisplayName: false })
        }
      },
      updateFullName: async (fullName: string) => {
        if (uid) {
          dispatch({ updatingFullName: true })
          await updateFullName(uid, fullName)
          dispatch({ updatingFullName: false })
        }
      },
      updateProfileImage: async (image: File) => {
        if (uid) {
          dispatch({ updatingProfileImage: true })
          await updateProfileImage(uid, image)
          const imageUrl = await profileImageUrl(uid)
          await setDoc(
            profileRef(uid),
            {
              profileImage: imageUrl
            },
            { merge: true }
          )
          dispatch({ updatingProfileImage: false })
        }
      },
      updateSocial: async (network: keyof SocialLinks, link: string) => {
        if (uid) {
          dispatch({
            updatingSocial: {
              ...state.updatingSocial,
              [network]: true
            }
          })
          await updateSocial(uid, network, link)
          dispatch({
            updatingSocial: {
              ...state.updatingSocial,
              [network]: false
            }
          })
        }
      },
      updateContactInfo: async (
        contactType: keyof ContactInfo,
        contact: string | number
      ) => {
        if (uid) {
          dispatch({
            updatingContactInfo: {
              ...state.updatingContactInfo,
              [contactType]: true
            }
          })
          await updateContactInfo(uid, contactType, contact)
          dispatch({
            updatingSocial: {
              ...state.updatingSocial,
              [contactType]: false
            }
          })
        }
      },
      updateOrgCategory: async (category: OrgCategory) => {
        if (uid) {
          dispatch({ updatingOrgCategory: true })
          await updateOrgCategory(uid, category)
          dispatch({ updatingOrgCategory: false })
        }
      },
      updateBillsFollowing: async (billsFollowing: string[]) => {
        if (uid) {
          dispatch({ updatingBillsFollowing: true })
          await updateBillsFollowing(uid, billsFollowing)
          dispatch({ updatingBillsFollowing: false })
        }
      }
    }),
    [uid, state.updatingSocial, state.updatingContactInfo]
  )

  return useMemo(
    () => ({
      ...state,
      ...callbacks,
      profile,
      loading
    }),
    [callbacks, loading, profile, state]
  )
}

function updateRepresentative(
  uid: string,
  representative: ProfileMember | null
) {
  return setDoc(
    profileRef(uid),
    { representative: representative ?? deleteField() },
    { merge: true }
  )
}

function updateSenator(uid: string, senator: ProfileMember | null) {
  return setDoc(
    profileRef(uid),
    { senator: senator ?? deleteField() },
    { merge: true }
  )
}

function updateIsPublic(uid: string, isPublic: boolean) {
  return setDoc(profileRef(uid), { public: isPublic }, { merge: true })
}

function updateNotification(uid: string, notificationFrequency: Frequency) {
  return setDoc(
    profileRef(uid),
    { notificationFrequency: notificationFrequency },
    { merge: true }
  )
}

function updateIsOrganization(uid: string, isOrganization: boolean) {
  return setDoc(
    profileRef(uid),
    { organization: isOrganization },
    { merge: true }
  )
}

function updateOrgCategory(uid: string, category: OrgCategory) {
  return setDoc(profileRef(uid), { orgCategories: [category] }, { merge: true })
}

function updateSocial(uid: string, network: keyof SocialLinks, link: string) {
  link = cleanSocialLinks(network, link)

  return setDoc(
    profileRef(uid),
    { social: { [network]: link ?? deleteField() } },
    { merge: true }
  )
}

function updateContactInfo(
  uid: string,
  contactType: keyof ContactInfo,
  contact: string | number
) {
  if (contactType === "website") {
    contact = contact.toString()
    contact = cleanOrgURL(contact)
  }

  return setDoc(
    profileRef(uid),
    { contactInfo: { [contactType]: contact ?? deleteField() } },
    { merge: true }
  )
}

function updateAbout(uid: string, about: string) {
  return setDoc(
    profileRef(uid),
    { about: about ?? deleteField() },
    { merge: true }
  )
}

function updateDisplayName(uid: string, displayName: string) {
  return setDoc(
    profileRef(uid),
    { displayName: displayName ?? deleteField() },
    { merge: true }
  )
}

function updateFullName(uid: string, fullName: string) {
  return setDoc(
    profileRef(uid),
    { fullName: fullName ?? deleteField() },
    { merge: true }
  )
}

function updateBillsFollowing(uid: string, billsFollowing: string[]) {
  return setDoc(
    profileRef(uid),
    { billsFollowing: billsFollowing ?? deleteField() },
    { merge: true }
  )
}

export const profileImageRef = (uid: string) =>
  ref(storage, `/users/${uid}/profileImage`)

export const profileImageUrl = (uid: string) =>
  getDownloadURL(profileImageRef(uid))

export async function updateProfileImage(uid: string, image: File) {
  // TODO: update profile image URL for display
  const result = await uploadBytes(profileImageRef(uid), image, {
    contentDisposition: "inline",
    contentType: image.type,
    cacheControl: "private, max-age=3600"
  })
}

export function usePublicProfile(uid?: string, verifyisorg?: boolean) {
  if (verifyisorg && uid) {
    console.log(verifyisorg)
  }
  return useAsync(
    () => (uid ? getProfile(uid, verifyisorg) : Promise.resolve(undefined)),
    [uid, verifyisorg]
  )
}

export async function getProfile(uid: string, verifyisorg?: boolean) {
  const snap = await getDoc(profileRef(uid))
  if (verifyisorg) {
    return snap.exists() && snap.data().role == "organization"
      ? (snap.data() as Profile)
      : undefined
  }

  return snap.exists() ? (snap.data() as Profile) : undefined
}

export function setProfile(uid: string, profileData: Partial<Profile>) {
  return setDoc(profileRef(uid), profileData, { merge: true })
}
