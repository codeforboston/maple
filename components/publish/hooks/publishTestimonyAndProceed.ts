import { DraftTestimony } from "../../db"
import { createAppThunk } from "../../hooks"
import { setStep } from "../redux"

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

    const hasLegislators = Boolean(profile?.representative && profile.senator)
    if (hasLegislators) {
      dispatch(setStep("share"))
    } else {
      dispatch(setStep("selectLegislators"))
    }
  }
)
