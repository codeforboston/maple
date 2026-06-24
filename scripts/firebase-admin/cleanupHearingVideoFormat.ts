import { FieldValue } from "../../functions/src/firebase"
import { reformatFactory } from "./updateHearingVideoFormat"
import { Script } from "./types"

function getVideoFormatCleanup(
  data: FirebaseFirestore.DocumentData
): any {
  if (!("videoURL" in data)) {
    return {}
  }
  
  return {
    videoTranscriptionId: FieldValue.delete(),
    videoFetchedAt: FieldValue.delete(),
    videoURL: FieldValue.delete()
  }
}

export const script: Script = reformatFactory(getVideoFormatCleanup)