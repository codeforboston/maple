import { testDb } from "../testUtils"
import { DraftTestimony, publishTestimony } from "../../components/db"
import { currentGeneralCourt } from "common/constants"
import { loremIpsum } from "lorem-ipsum"
import { signInUser3, signInUser4 } from "../integration/common"
import { User } from "firebase/auth"

type UserTestimonySeedConfig = "draft" | "testimony" | "both" | undefined
type SeedConfig = {
  billId: string
  u3: UserTestimonySeedConfig
  u4: UserTestimonySeedConfig
}

const config: SeedConfig[] = [
  { billId: "H1", u3: "both", u4: "testimony" },
  { billId: "H10", u3: "both", u4: "draft" },
  { billId: "H1001", u3: "testimony", u4: "draft" },
  { billId: "H1002", u3: "both", u4: "both" },
  { billId: "H1003", u3: "draft", u4: "draft" },
  { billId: "H1004", u3: "draft", u4: undefined }
]

const positions = ["endorse", "oppose", "neutral"] as const
const createDraft = (billId: string) => {
  const draft: DraftTestimony = {
    billId,
    court: currentGeneralCourt,
    position: positions[Math.floor(Math.random() * positions.length)],
    content: loremIpsum({ count: 4, units: "paragraphs" })
  }
  return draft
}

export default async function seedTestimony() {
  for (let bill of config) {
    await seedUserTestimony(bill.billId, bill.u3, signInUser3)
    await seedUserTestimony(bill.billId, bill.u4, signInUser4)
  }
}

async function seedUserTestimony(
  billId: string,
  type: UserTestimonySeedConfig,
  signInUser: () => Promise<User>
) {
  if (type === undefined) return

  const { uid } = await signInUser()
  const draft = createDraft(billId)

  const draftRef = await testDb
    .collection(`/users/${uid}/draftTestimony`)
    .add(draft)

  if (type === "draft") return

  await publishTestimony({ draftId: draftRef.id })

  if (type === "both") return

  await draftRef.delete()
}

it("seeds drafts and testimony", seedTestimony)
