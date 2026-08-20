const ALLOW_FLAG = "__MAPLE_STORYBOOK_ALLOW_FIREBASE__"
const WARNED_FLAG = "__MAPLE_STORYBOOK_FIREBASE_WARNED__"
const AUTH_STATE_KEY = "__MAPLE_STORYBOOK_FIREBASE_AUTH_STATE__"

function canAllowInRuntime() {
  if (typeof globalThis !== "undefined") {
    return Boolean(globalThis[ALLOW_FLAG])
  }
  return false
}

function canAllowFromEnv() {
  return process.env.STORYBOOK_ALLOW_FIREBASE_CALLS === "1"
}

function shouldAllowFirebaseCall() {
  return canAllowFromEnv() || canAllowInRuntime()
}

function warnOnce(key, message) {
  if (typeof globalThis === "undefined") return

  if (!globalThis[WARNED_FLAG]) {
    globalThis[WARNED_FLAG] = new Set()
  }

  const warned = globalThis[WARNED_FLAG]
  if (!warned.has(key)) {
    warned.add(key)
    console.warn(message)
  }
}

function throwBlockedFirebaseCall(service, apiName, helpText) {
  if (shouldAllowFirebaseCall()) return

  const message = [
    `[Storybook Firebase Guard] Blocked ${service} call: ${apiName}`,
    "Real Firebase calls are disabled by default in Storybook.",
    "Mock the component data/hooks used by this story instead.",
    helpText,
    "To opt out temporarily for a specific story, set: parameters.firebaseGuard.allow = true",
    "To opt out globally, start Storybook with STORYBOOK_ALLOW_FIREBASE_CALLS=1"
  ].join("\n")

  warnOnce(`${service}:${apiName}`, message)
  throw new Error(message)
}

function getStorybookAuthState() {
  if (typeof globalThis === "undefined") return { user: null }

  return globalThis[AUTH_STATE_KEY] ?? { user: null }
}

function setStorybookAuthState(state) {
  if (typeof globalThis !== "undefined") {
    globalThis[AUTH_STATE_KEY] = state
  }
  return state
}

module.exports = {
  getStorybookAuthState,
  setStorybookAuthState,
  shouldAllowFirebaseCall,
  throwBlockedFirebaseCall
}
