import axios from "axios"
import { auth } from "../firebase"

// This is for querying the backend api deployed on Next
// See /pages/api/* for routes
export const mapleClient = axios.create()

mapleClient.interceptors.request.use(async config => {
  const authenticationToken = await auth.currentUser?.getIdToken(true)
  config.headers = {
    ...config.headers,
    // Adds authentication token, see https://firebase.google.com/docs/auth/admin/verify-id-tokens#node.js
    // And middleware.ts
    Authorization: `Bearer ${authenticationToken}`
  }
  return config
})

mapleClient.interceptors.response.use(
  value => {
    if (value.status === 401) {
      return "not logged in as admin"
    }
  },
  async error => {
    console.log(error.message)
  }
)
