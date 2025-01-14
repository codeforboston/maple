/*import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { User } from "firebase/auth"
import { Maybe } from "../db/common"
import { useAppSelector } from "../hooks"
import { Bill } from "./types"
import { Results } from "components/shared/FollowingQueries"

/*export type AuthFlowStep =
  | "start"
  | "signIn"
  | "userSignUp"
  | "orgSignUp"
  | "forgotPassword"
  | "verifyEmail"
  | "chooseProfileType"
  | null */
/*
export interface State {
  /** null if the user is signed out, undefined if the auth state hasn't been
   * initialized */
  //user: Maybe<User>
  /** Only set if authenticated */
  //bill?: Bill
  /** True iff user is signed in */
 //following: boolean
  //bills: { [key: string]: string[] }
  //authenticated: boolean
  //authFlowStep: AuthFlowStep
//}
/*
export interface State {
  loading: boolean
  bill?: Bill
}

//const initialState: State = { loading: true }

const initialState: State = {
  following: false,
  user: undefined,
  bills: { 'bills': [] },
  loading: true
  //authFlowStep: null
}

export const {
  reducer,
  actions: { billFollowChanged }
} = createSlice({
  name: "bill",
  initialState,
  reducers: {
    billFollowChanged(state, action: PayloadAction<Results | undefined>) {
      state.bills = action.payload
    }
  }
})

export const useAuth = () => useAppSelector(state => state.bills)

*/


/*
export interface State {
  loading: boolean
  profile?: Profile
}

const initialState: State = { loading: true }
//
export const {
  reducer,
  actions: { profileChanged }
} = createSlice({
  name: "profile",
  initialState,
  reducers: {
    profileChanged(state, action: PayloadAction<Profile | undefined>) {
      state.profile = action.payload
      state.loading = !Boolean(action.payload)
    }
  }
})

export const useProfileState = () => useAppSelector(({ profile }) => profile)
*/