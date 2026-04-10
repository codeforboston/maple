import { Script } from "./types"

type Counts = {
  testimonyCount: number
  endorseCount: number
  neutralCount: number
  opposeCount: number
}

const zeroCounts = (): Counts => ({
  testimonyCount: 0,
  endorseCount: 0,
  neutralCount: 0,
  opposeCount: 0
})

export const script: Script = async ({ db }) => {
  const writer = db.bulkWriter()
  const countsByBallotQuestionId = new Map<string, Counts>()

  const [ballotQuestionsSnap, testimonySnap] = await Promise.all([
    db.collection("ballotQuestions").select().get(),
    db
      .collectionGroup("publishedTestimony")
      .select("ballotQuestionId", "position")
      .get()
  ])

  testimonySnap.forEach(doc => {
    const data = doc.data()
    const ballotQuestionId =
      typeof data.ballotQuestionId === "string" ? data.ballotQuestionId : null
    if (!ballotQuestionId) return

    const counts =
      countsByBallotQuestionId.get(ballotQuestionId) ?? zeroCounts()
    counts.testimonyCount += 1

    switch (data.position) {
      case "endorse":
        counts.endorseCount += 1
        break
      case "neutral":
        counts.neutralCount += 1
        break
      case "oppose":
        counts.opposeCount += 1
        break
    }

    countsByBallotQuestionId.set(ballotQuestionId, counts)
  })

  ballotQuestionsSnap.forEach(doc => {
    writer.update(doc.ref, countsByBallotQuestionId.get(doc.id) ?? zeroCounts())
  })

  await writer.close()
  console.log(
    `Updated ${ballotQuestionsSnap.size} ballot question(s) using ${testimonySnap.size} published testimony document(s).`
  )
}
