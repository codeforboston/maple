import { doc, onSnapshot, setDoc } from "firebase/firestore"
import { useEffect, useMemo, useReducer } from "react"
import { useAuth } from "../auth"
import { firestore } from "../firebase"

export type ProfileMember = {
  district: string
  id: string
  name: string
}
export type Profile = {
  representative?: ProfileMember
  senator?: ProfileMember
}
export type ProfileHook = ReturnType<typeof useProfile>

type ProfileState = {
  loading: boolean
  updatingRep: boolean
  updatingSenator: boolean
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
      }
    }),
    [uid]
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
