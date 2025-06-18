import { DraftTestimony } from "common/testimony/types"
import { createAppThunk } from "../../hooks"

/** Publishes testimony and forwards the user to the correct next step */
export const publishTestimonyAndProceed = createAppThunk(
  "publish/publishTestimony",
  async (_, { dispatch, getState }) => {
    const {
      publish: { step, sync, draft, service: edit },
      profile: { profile }
    } = getState()

    if (step !== "publish") throw Error("must be on publish step to publish")
    if (sync === "loading" || sync === "unsaved")
      throw Error("must be synced to publish")

    DraftTestimony.check(draft)

    await edit?.publishTestimony.execute()
  }
)
