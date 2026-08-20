import type { User } from "firebase/auth"

type StorybookAuthState =
  | {
      user: null
      claims?: undefined
    }
  | {
      user: User
      claims?: {
        role?: string
        email_verified?: boolean
      }
    }

const AUTH_STATE_KEY = "__MAPLE_STORYBOOK_FIREBASE_AUTH_STATE__"

function setGlobalAuthState(state: StorybookAuthState) {
  if (typeof globalThis !== "undefined") {
    ;(globalThis as any)[AUTH_STATE_KEY] = state
  }
}

export function mockLoggedOutAuthState() {
  const state: StorybookAuthState = { user: null }
  setGlobalAuthState(state)
  return state
}

export function mockLoggedInUserAuthState(overrides?: Partial<User>) {
  const user = {
    uid: "storybook-user",
    email: "storybook-user@example.com",
    emailVerified: true,
    displayName: "Storybook User",
    isAnonymous: false,
    providerId: "firebase",
    photoURL: null,
    phoneNumber: null,
    tenantId: null,
    metadata: {
      creationTime: "",
      lastSignInTime: ""
    },
    providerData: [],
    refreshToken: "storybook-refresh-token",
    stsTokenManager: {
      accessToken: "storybook-access-token",
      refreshToken: "storybook-refresh-token",
      expirationTime: Date.now() + 60 * 60 * 1000
    },
    getIdToken: async () => "storybook-id-token",
    getIdTokenResult: async () => ({
      token: "storybook-id-token",
      authTime: "",
      issuedAtTime: "",
      expirationTime: "",
      signInProvider: null,
      claims: {
        role: "user",
        email_verified: true
      }
    }),
    reload: async () => undefined,
    delete: async () => undefined,
    toJSON: () => ({})
  } as unknown as User

  const state: StorybookAuthState = {
    user: { ...user, ...overrides },
    claims: { role: "user", email_verified: true }
  }

  setGlobalAuthState(state)
  return state
}

export function setStorybookAuthState(state: StorybookAuthState) {
  setGlobalAuthState(state)
  return state
}

export function resetStorybookAuthState() {
  return mockLoggedOutAuthState()
}
