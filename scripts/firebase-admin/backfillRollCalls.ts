import { Record, Number, Optional, String } from "runtypes"
import { Script } from "./types"
import {
  HouseRollCallScraper,
  SenateRollCallScraper
} from "functions/src/votes"
import { getSenateLegislators } from "functions/src/votes/scrapeRollCall"

const Args = Record({
  court: Number,
  endCourt: Optional(Number),
  number: Optional(Number),
  endNumber: Optional(Number),
  branch: Optional(String)
})

export const script: Script = async ({ db, args }) => {
  let { court, endCourt, number, endNumber, branch } = Args.check(args)

  endCourt = endCourt ?? court
  if (number && !endNumber) {
    endNumber = number
  }
  if (!number) {
    number = 0
  }
  const writer = db.bulkWriter()
  const houseScraper = new HouseRollCallScraper()
  const senateScraper = new SenateRollCallScraper()
  for (; court <= endCourt; court++) {
    for (
      let rollCallNumber = number;
      !endNumber || rollCallNumber <= endNumber;
      rollCallNumber++
    ) {
      if (!branch) {
        let result = await senateScraper.addRollCall(
          writer,
          court,
          rollCallNumber
        )
        if (result !== "success") {
          console.log(
            `Error fetching senate rollcall ${rollCallNumber} for court ${court}: ${result}`
          )
          return
        }
        result = await houseScraper.addRollCall(writer, court, rollCallNumber)
        if (result !== "success") {
          console.log(
            `Error fetching house rollcall ${rollCallNumber} for court ${court}: ${result}`
          )
          return
        }
      } else if (branch === "Senate") {
        const result = await senateScraper.addRollCall(
          writer,
          court,
          rollCallNumber
        )
        if (result !== "success") {
          console.log(
            `Error fetching senate rollcall ${rollCallNumber} for court ${court}: ${result}`
          )
          return
        }
      } else if (branch === "House") {
        const result = await houseScraper.addRollCall(
          writer,
          court,
          rollCallNumber
        )
        if (result !== "success") {
          console.log(
            `Error fetching house rollcall ${rollCallNumber} for court ${court}: ${result}`
          )
          return
        }
      }
    }
  }
  await writer.close()
}
