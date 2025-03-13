import { TextEncoder, TextDecoder } from "util"
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

export {}

jest.mock("../components/db/common", () => {
  const actualModule = jest.requireActual("../components/db/common")
  return {
    __esModule: true,
    ...actualModule,
    midnight: jest.fn(actualModule.midnight),
    now: jest.fn(actualModule.now)
  }
})
