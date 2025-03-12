import * as functions from "firebase-functions"
import { AssemblyAI } from "assemblyai"
import { db } from "../firebase"

const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
})

export const transcription = functions.https.onRequest(async (req, res) => {
  console.log(req.body)
  if (req.body.status === "completed") {
    const transcript = await assembly.transcripts.get(req.body.transcript_id)
    if (transcript) {
      try {
        await db.collection("transcriptions").doc(transcript.id).set(transcript)
        console.log("transcript saved in db")
      } catch (error) {
        console.log(error)
      }
    }
  }
})
