import { deleteField, doc, getDoc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { useMemo, useReducer } from "react"
import { useAsync } from "react-async-hook"
import { useAuth } from "../../auth"
import { firestore, storage } from "../../firebase"
import { useProfileState } from "./redux"
import { Profile, ProfileMember, SocialLinks } from "./types"

export type ProfileHook = ReturnType<typeof useProfile>

type ProfileState = {
  loading: boolean
  updatingRep: boolean
  updatingSenator: boolean
  updatingIsPublic: boolean
  updatingIsOrganization: boolean
  updatingAbout: boolean
  updatingDisplayName: boolean
  updatingFullName: boolean
  updatingProfileImage: boolean
  updatingSocial: Record<keyof SocialLinks, boolean>
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
        updatingIsOrganization: false,
        updatingAbout: false,
        updatingDisplayName: false,
        updatingFullName: false,
        updatingProfileImage: false,
        updatingSocial: {
          linkedIn: false,
          twitter: false
        },
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
      }
    }),
    [uid, state.updatingSocial]
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

function updateIsOrganization(uid: string, isOrganization: boolean) {
  return setDoc(
    profileRef(uid),
    { organization: isOrganization },
    { merge: true }
  )
}

function updateSocial(uid: string, network: keyof SocialLinks, link: string) {
  return setDoc(
    profileRef(uid),
    { social: { [network]: link ?? deleteField() } },
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

export function usePublicProfile(uid?: string) {
  return useAsync(
    () => (uid ? getProfile(uid) : Promise.resolve(undefined)),
    [uid]
  )
}

export async function getProfile(uid: string) {
  const snap = await getDoc(profileRef(uid))
  return snap.exists() ? (snap.data() as Profile) : undefined
}

export function setProfile(uid: string, profileData: Partial<Profile>) {
  return setDoc(profileRef(uid), profileData, { merge: true })
}
