const BrowserEnvironment = require("jest-environment-jsdom")
const timers = require("timers")

class IntegrationEnvironment extends BrowserEnvironment {
  constructor(config) {
    super(
      Object.assign({}, config, {
        globals: Object.assign({}, config.globals, {
          // https://github.com/firebase/firebase-js-sdk/issues/3096#issuecomment-637584185
          Uint32Array: Uint32Array,
          Uint8Array: Uint8Array,
          ArrayBuffer: ArrayBuffer,

          // These are required to run the admin sdk in a jsdom environment
          setImmediate: timers.setImmediate,
          setTimeout: timers.setTimeout,
          setInterval: timers.setInterval,
          clearImmediate: timers.clearImmediate,
          clearTimeout: timers.clearTimeout,
          clearInterval: timers.clearInterval
        })
      })
    )
  }

  async setup() {}

  async teardown() {}
}

module.exports = IntegrationEnvironment
