import { listHearings } from "./malegislature"

jest.setTimeout(40000)
it("works", async () => {
  await listHearings()
})
