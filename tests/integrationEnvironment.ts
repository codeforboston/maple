import type { JestEnvironmentConfig, EnvironmentContext } from "@jest/environment"
import BrowserEnvironment from "jest-environment-jsdom"
import timers from "timers"

class IntegrationEnvironment extends BrowserEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context)
  }

  async setup() {
    await super.setup()

    // https://github.com/firebase/firebase-js-sdk/issues/3096#issuecomment-637584185
    this.global.Uint32Array = Uint32Array
    this.global.Uint8Array = Uint8Array
    this.global.ArrayBuffer = ArrayBuffer

    // These are required to run the admin sdk in a jsdom environment
    this.global.setImmediate = timers.setImmediate as typeof globalThis.setImmediate
    this.global.setTimeout = timers.setTimeout as typeof globalThis.setTimeout
    this.global.setInterval = timers.setInterval as typeof globalThis.setInterval
    this.global.clearImmediate = timers.clearImmediate
    this.global.clearTimeout = timers.clearTimeout as typeof globalThis.clearTimeout
    this.global.clearInterval = timers.clearInterval as typeof globalThis.clearInterval

    /** jsdom's Blob implementation does not work with firebase/storage.
     * firebase/storage *does* work with a fallback if Blob is not
     * available, so removing the global is a hack to get storage tests
     * working. We'll need a better solution when tests need to use Blobs.
     * */
    ;(this.global as any).Blob = undefined
  }

  async teardown() {
    await super.teardown()
  }
}

export default IntegrationEnvironment
