import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { useAppSelector } from "../../hooks"
import { Profile } from "./types"

export interface State {
  loading: boolean
  profile?: Profile
}

const initialState: State = { loading: true }

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
