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
  loading: boolean
  authFlowStep: AuthFlowStep
  isFromProtectedPage: boolean
  protectedPageUrl?: string
  justLoggedOut: boolean
}

const initialState: State = {
  authenticated: false,
  user: undefined,
  loading: true,
  authFlowStep: null,
  isFromProtectedPage: false,
  protectedPageUrl: undefined,
  justLoggedOut: false
}

export const {
  reducer,
  actions: {
    authChanged,
    authStepChanged,
    setProtectedPageAccess,
    setJustLoggedOut
  }
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
    },
    setProtectedPageAccess(
      state,
      action: PayloadAction<{ isFromProtectedPage: boolean; url?: string }>
    ) {
      state.isFromProtectedPage = action.payload.isFromProtectedPage
      state.protectedPageUrl = action.payload.url
    },
    setJustLoggedOut(state, action: PayloadAction<boolean>) {
      state.justLoggedOut = action.payload
    }
  }
})

export const useAuth = () => useAppSelector(state => state.auth)
