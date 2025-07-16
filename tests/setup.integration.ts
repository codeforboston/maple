export {}
import { TextEncoder, TextDecoder } from "util"

Object.assign(global, { TextDecoder, TextEncoder })
jest.mock("../components/db/common", () => {
  const actualModule = jest.requireActual("../components/db/common")
  return {
    __esModule: true,
    ...actualModule,
    midnight: jest.fn(actualModule.midnight),
    now: jest.fn(actualModule.now)
  }
})
