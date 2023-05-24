import { render } from "@testing-library/react"
import { renderHook } from "@testing-library/react-hooks"
import { EditProfile } from "components/EditProfilePage/EditProfilePage"
import { Profile, setProfile, useProfile } from "components/db"
import { auth } from "components/firebase"

import { User, UserCredential, signInWithEmailAndPassword } from "firebase/auth"
import { useTranslation, I18n, I18nContext, i18n } from "next-i18next"
import { setRole } from "../../functions/src/auth"
import { testAuth, testDb } from "../testUtils"
import { getProfile, signInUser1 } from "./common"
import configureStore from "redux-mock-store"
import { createAppThunk, useAppDispatch, useAppStore } from "components/hooks"
import { Provider } from "react-redux"

let user1: User
let creds!: UserCredential

const setUpLoggedInUser = async () => {
  user1 = await signInUser1()
  expect(user1).toBeDefined()

  creds = await signInWithEmailAndPassword(auth, user1!.email!, "password")
  expect(user1.displayName).toBeDefined()

  await setProfile(user1.uid, { fullName: "user1" })

  await setRole({
    uid: user1.uid,
    role: "user",
    auth: testAuth,
    db: testDb
  })

  const profile = await getProfile({ uid: user1.uid })

  expect(profile).toBeTruthy()

  expect(profile?.fullName).toBeDefined()

  expect(profile).toMatchObject({
    public: false,
    fullName: "user1",
    role: "user"
  })
}

beforeAll(async () => {
  await setUpLoggedInUser()
  expect(user1).toBeDefined()
  expect(creds).toBeDefined()
})

// it.skip("renders editprofileform without crashing", async () => {
//   const profile = (await getProfile({ uid: user1.uid })) as Profile
//   expect(profile.fullName).toBeDefined()
//   expect(profile.fullName).toEqual("user1")

//   const { result: profileResult } = renderHook(useProfile)
//   const actions = profileResult.current
//   const uid = user1.uid

//   const { result } = renderHook(() => useTranslation("editProfile"))
//   const { t } = result.current

//   render(<EditProfile />)
// })

// it.skip("renders personal info tab", async () => {
//   const updateProfile = jest.fn((props: any) => Promise<void>)

//   const { result } = renderHook(() => useProfile())

//   const { result: dispatch } = renderHook(() => useAppDispatch())

//   const { result: store } = renderHook(() => useAppStore())

//   const { result: thunk } = renderHook(() => createAppThunk(dispatch.current, getState))

//   render(<Provider store={store.current}>{<div></div>}</Provider>)

//   console.log(result.current.profile)
// })
