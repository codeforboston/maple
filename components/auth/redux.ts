import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { User } from "firebase/auth"
import { Maybe } from "../db/common"
import { useAppSelector } from "../hooks"
import { Claim } from "./types"

export type AuthFlowStep =
  | "start"
  | "signIn"
  | "userSignUp"
  | "orgSignUp"
  | "forgotPassword"
  | "verifyEmail"
  | "chooseProfileType"
  | null

export interface State {
  /** null if the user is signed out, undefined if the auth state hasn't been
   * initialized */
  user: Maybe<User>
  /** Only set if authenticated */
  claims?: Claim
  /** True iff user is signed in */
  authenticated: boolean
  authFlowStep: AuthFlowStep
  loading: boolean
}

const initialState: State = {
  authenticated: false,
  user: undefined,
  authFlowStep: null,
  loading: true
}

export const {
  reducer,
  actions: { authChanged, authStepChanged }
} = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authChanged(
      state,
      { payload }: PayloadAction<{ user: User | null; claims?: Claim }>
    ) {
      state.user = payload.user
      state.claims = payload.claims
      state.authenticated = Boolean(payload.user)
      state.loading = false
    },
    authStepChanged(state, action: PayloadAction<AuthFlowStep>) {
      state.authFlowStep = action.payload
    }
  }
})

export const useAuth = () => useAppSelector(state => state.auth)
