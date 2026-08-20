const authModule = require("@firebase/auth")
const {
  getStorybookAuthState,
  setStorybookAuthState,
  shouldAllowFirebaseCall,
  throwBlockedFirebaseCall
} = require("./common")

function emitAuthState(callback) {
  const { user } = getStorybookAuthState()
  callback(user)
}

function block(apiName) {
  return () => {
    throwBlockedFirebaseCall(
      "auth",
      apiName,
      "Mock auth state in your story providers or pass explicit props that avoid auth hooks."
    )
  }
}

function onAuthStateChanged(auth, nextOrObserver, error, completed) {
  if (shouldAllowFirebaseCall()) {
    return authModule.onAuthStateChanged(auth, nextOrObserver, error, completed)
  }

  const callback =
    typeof nextOrObserver === "function"
      ? nextOrObserver
      : nextOrObserver?.next ?? (() => undefined)

  emitAuthState(callback)

  return () => undefined
}

function patchAuthInstance(auth) {
  if (!auth || shouldAllowFirebaseCall()) return auth

  return new Proxy(auth, {
    get(target, prop, receiver) {
      if (prop === "onAuthStateChanged") {
        return onAuthStateChanged
      }
      return Reflect.get(target, prop, receiver)
    }
  })
}

function getAuth(...args) {
  const auth = authModule.getAuth(...args)
  return patchAuthInstance(auth)
}

function initializeAuth(...args) {
  const auth = authModule.initializeAuth(...args)
  return patchAuthInstance(auth)
}

module.exports = {
  ...authModule,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword: block("signInWithEmailAndPassword"),
  signInWithPopup: block("signInWithPopup"),
  signInWithRedirect: block("signInWithRedirect"),
  signInAnonymously: block("signInAnonymously"),
  mockLoggedOutAuthState() {
    return setStorybookAuthState({ user: null })
  },
  mockLoggedInUserAuthState(overrides = {}) {
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
    }

    return setStorybookAuthState({
      user: { ...user, ...overrides },
      claims: { role: "user", email_verified: true }
    })
  }
}
