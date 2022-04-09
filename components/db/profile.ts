import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore"
import { useEffect, useMemo, useReducer } from "react"
import { useAuth } from "../auth"
import { firestore } from "../firebase"
import { useAsync } from "react-async-hook"

export type ProfileMember = {
  district: string
  id: string
  name: string
}

export const SOCIAL_NETWORKS = ["linkedIn", "twitter"] as const

export type SocialLinks = Partial<
  Record<typeof SOCIAL_NETWORKS[number], string>
>

export type Profile = {
  displayName?: string
  representative?: ProfileMember
  senator?: ProfileMember
  public?: boolean
  about?: string
  social?: SocialLinks
  organization?: boolean
}

export type ProfileHook = ReturnType<typeof useProfile>

type ProfileState = {
  loading: boolean
  updatingRep: boolean
  updatingSenator: boolean
  updatingIsPublic: boolean
  updatingIsOrganization: boolean
  updatingAbout: boolean
  updatingSocial: Record<keyof SocialLinks, boolean>
  profile: Profile | undefined
}

const profileRef = (uid: string) => doc(firestore, `/profiles/${uid}`)

export function useProfile() {
  const { user } = useAuth(),
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
        updatingSocial: {
          linkedIn: false,
          twitter: false
        },
        profile: undefined
      }
    )

  useEffect(() => {
    if (uid) {
      return onSnapshot(profileRef(uid), snapshot => {
        dispatch({ profile: snapshot.data() ?? {}, loading: false })
      })
    }
  }, [uid])

  const callbacks = useMemo(
    () => ({
      updateSenator: async (senator: ProfileMember) => {
        if (uid) {
          dispatch({ updatingSenator: true })
          await updateSenator(uid, senator)
          dispatch({ updatingSenator: false })
        }
      },
      updateRep: async (rep: ProfileMember) => {
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
      loading: state.profile === undefined
    }),
    [callbacks, state]
  )
}

function updateRepresentative(uid: string, representative: ProfileMember) {
  return setDoc(profileRef(uid), { representative }, { merge: true })
}

function updateSenator(uid: string, senator: ProfileMember) {
  return setDoc(profileRef(uid), { senator }, { merge: true })
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
    { social: { [network]: link } },
    { merge: true }
  )
}

function updateAbout(uid: string, about: string) {
  return setDoc(profileRef(uid), { about }, { merge: true })
}

export function usePublicProfile(uid: string) {
  return useAsync(getProfile, [uid])
}

export async function getProfile(uid: string) {
  const snap = await getDoc(profileRef(uid))
  return snap.exists() ? (snap.data() as Profile) : undefined
}
