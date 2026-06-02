import {
  AssemblyAI,
  Transcript,
  TranscriptParagraph,
  TranscriptUtterance,
  TranscriptWord
} from "assemblyai"
import { db, storage } from "../firebase"
import { randomBytes } from "node:crypto"
import { sha256 } from "js-sha256"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"

abstract class AssemblyAIHandlerBase {
  abstract submitTranscription({
    EventId,
    videoUrl,
    bucketName
  }: {
    EventId: number
    videoUrl: string
    bucketName?: string
  }): Promise<string>

  async submitTranscriptions({
    EventId,
    videoUrls,
    bucketName
  }: {
    EventId: number
    videoUrls: string[]
    bucketName?: string
  }): Promise<string[]> {
    const transcriptionIds = await Promise.all(
      videoUrls.map(item => {
        return this.submitTranscription({ videoUrl: item, EventId, bucketName })
      })
    )

    return transcriptionIds
  }

  abstract getTranscript(transcript_id: string): Promise<Transcript>
  abstract fetchParagraphs(
    transcript_id: string
  ): Promise<TranscriptParagraph[]>
}

export class AssemblyAIHandler extends AssemblyAIHandlerBase {
  assembly: AssemblyAI

  constructor({ apiKey }: { apiKey: string }) {
    super()
    this.assembly = new AssemblyAI({
      apiKey
    })
  }

  async submitTranscription({
    EventId,
    videoUrl,
    bucketName
  }: {
    EventId: number
    videoUrl: string
    bucketName?: string
  }): Promise<string> {
    const newToken = randomBytes(16).toString("hex")
    const audioUrl = await extractAudioFromVideo(EventId, videoUrl, bucketName)

    const transcript = await this.assembly.transcripts.submit({
      audio:
        // test with: "https://assemblyaiusercontent.com/playground/aKUqpEtmYmI.flac",
        audioUrl,
      webhook_url:
        // make sure process.env.FUNCTIONS_API_BASE equals
        // https://us-central1-digital-testimony-prod.cloudfunctions.net
        // on prod. test with:
        // "https://ngrokid.ngrok-free.app/demo-dtp/us-central1/transcription",
        `${process.env.FUNCTIONS_API_BASE}/transcription`,
      speaker_labels: true,
      webhook_auth_header_name: "x-maple-webhook",
      webhook_auth_header_value: newToken
    })

    await db
      .collection("events")
      .doc(`hearing-${String(EventId)}`)
      .collection("private")
      .doc(transcript.id)
      .set({
        videoAssemblyWebhookToken: sha256(newToken)
      })

    return transcript.id
  }

  async getTranscript(transcript_id: string): Promise<Transcript> {
    return await this.assembly.transcripts.get(transcript_id)
  }

  async fetchParagraphs(transcript_id: string): Promise<TranscriptParagraph[]> {
    return (await this.assembly.transcripts.paragraphs(transcript_id))
      .paragraphs
  }
}

export class AssemblyAIHandlerDummy extends AssemblyAIHandlerBase {
  async submitTranscription({
    EventId,
    videoUrl,
    bucketName
  }: {
    EventId: number
    videoUrl: string
    bucketName?: string
  }): Promise<string> {
    const token = randomBytes(16).toString("hex")
    const transcriptionId = `mock_${Math.random().toString(36).slice(2)}`

    setTimeout(async () => {
      await fetch("http://localhost:5001/demo-dtp/us-central1/transcription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-maple-webhook": token
        },
        body: JSON.stringify(await this.getTranscript(transcriptionId))
      })
    }, 10000)

    await db
      .collection("events")
      .doc(`hearing-${String(EventId)}`)
      .collection("private")
      .doc(transcriptionId)
      .set({
        videoAssemblyWebhookToken: sha256(token)
      })

    return transcriptionId
  }

  async getTranscript(transcriptId: string): Promise<Transcript> {
    return getTranscript(transcriptId).transcript
  }

  async fetchParagraphs(transcriptId: string): Promise<TranscriptParagraph[]> {
    return getTranscript(transcriptId).paragraphs
  }
}

const extractAudioFromVideo = async (
  EventId: number,
  videoUrl: string,
  bucketName?: string
): Promise<string> => {
  const tmpFilePath = `/tmp/hearing-${EventId}-${Date.now()}.m4a`

  // Stream directly from URL and copy audio codec
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoUrl)
      .noVideo()
      .audioCodec("copy")
      .format("mp4")
      .on("start", commandLine => {
        console.log(`Spawned FFmpeg with command: ${commandLine}`)
      })
      .on("end", () => {
        console.log("FFmpeg processing finished successfully")
        resolve()
      })
      .on("error", err => {
        console.error("FFmpeg error:", err)
        reject(err)
      })
      .save(tmpFilePath)
  })

  // Upload the audio file
  const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket()
  const audioFileName = `hearing-${EventId}-${Date.now()}.m4a`
  const file = bucket.file(audioFileName)

  const fileContent = await fs.promises.readFile(tmpFilePath)
  await file.save(fileContent, {
    metadata: {
      contentType: "audio/mp4"
    }
  })

  // Clean up temporary file
  await fs.promises.unlink(tmpFilePath)

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 24 * 60 * 60 * 1000
  })

  // Delete old files
  const [files] = await bucket.getFiles({
    prefix: "hearing-",
    maxResults: 1000
  })
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const oldFiles = files.filter(file => {
    const timestamp = parseInt(file.name.split("-").pop()?.split(".")[0] || "0")
    return timestamp < oneDayAgo
  })
  await Promise.all(oldFiles.map(file => file.delete()))

  // Return the new audio url
  return url
}

export const submitTranscription = async ({
  EventId,
  maybeVideoUrl,
  bucketName
}: {
  EventId: number
  maybeVideoUrl: string
  bucketName?: string
}) => {
  const assembly = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
  })

  const newToken = randomBytes(16).toString("hex")
  const audioUrl = await extractAudioFromVideo(
    EventId,
    maybeVideoUrl,
    bucketName
  )

  const transcript = await assembly.transcripts.submit({
    audio:
      // test with: "https://assemblyaiusercontent.com/playground/aKUqpEtmYmI.flac",
      audioUrl,
    webhook_url:
      // make sure process.env.FUNCTIONS_API_BASE equals
      // https://us-central1-digital-testimony-prod.cloudfunctions.net
      // on prod. test with:
      // "https://ngrokid.ngrok-free.app/demo-dtp/us-central1/transcription",
      `${process.env.FUNCTIONS_API_BASE}/transcription`,
    speaker_labels: true,
    webhook_auth_header_name: "x-maple-webhook",
    webhook_auth_header_value: newToken
  })

  await db
    .collection("events")
    .doc(`hearing-${String(EventId)}`)
    .collection("private")
    .doc("webhookAuth")
    .set({
      videoAssemblyWebhookToken: sha256(newToken)
    })

  return transcript.id
}

const WORD_BANK = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua"
]

const SPEAKERS = ["A", "B", "C"]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, precision = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(precision))
}

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function loremSentence(length: number) {
  return Array.from({ length }, () => {
    return WORD_BANK[randomInt(0, WORD_BANK.length - 1)]
  })
}

function loremParagraph(length: number) {
  return Array.from({ length }, () => loremSentence(randomInt(3, 10)))
}

/**
 * paragraphs -> sentences -> words
 */
function loremTranscriptStructure() {
  return Array.from({ length: randomInt(10, 20) }, () =>
    loremParagraph(randomInt(3, 8))
  )
}

export function getTranscript(transcript_id: string): {
  transcript: Transcript
  paragraphs: TranscriptParagraph[]
} {
  const structure = loremTranscriptStructure()

  const utterances: TranscriptUtterance[] = []
  const paragraphs: TranscriptParagraph[] = []
  const allWords: TranscriptWord[] = []

  let currentTime = 0

  for (const paragraph of structure) {
    const speaker = SPEAKERS[randomInt(0, SPEAKERS.length - 1)]

    const paragraphWords: TranscriptWord[] = []

    for (const sentence of paragraph) {
      const sentenceWords: TranscriptWord[] = []

      for (const token of sentence) {
        const confidence = randomFloat(0.5, 0.99)

        const word: TranscriptWord = {
          confidence,
          start: Number(currentTime.toFixed(2)),
          end: Number((currentTime + 1).toFixed(2)),
          speaker,
          text: token
        }

        sentenceWords.push(word)
        paragraphWords.push(word)
        allWords.push(word)

        currentTime += 300
      }

      const utterance: TranscriptUtterance = {
        confidence: Number(
          mean(sentenceWords.map(w => w.confidence)).toFixed(2)
        ),
        start: sentenceWords[0].start,
        end: sentenceWords[sentenceWords.length - 1].end,
        speaker,
        text: sentenceWords.map(w => w.text).join(" "),
        words: sentenceWords
      }

      utterances.push(utterance)

      currentTime += randomInt(100, 3000)
    }

    const transcriptParagraph: TranscriptParagraph = {
      confidence: Number(
        mean(paragraphWords.map(w => w.confidence)).toFixed(2)
      ),
      start: paragraphWords[0].start,
      end: paragraphWords[paragraphWords.length - 1].end,
      text: paragraphWords.map(w => w.text).join(" "),
      words: paragraphWords
    }

    paragraphs.push(transcriptParagraph)

    currentTime += randomInt(500, 7000)
  }

  const transcript: Transcript = {
    acoustic_model: "no",
    audio_url: "https://example.com/definitely-a-video",
    auto_highlights: false,
    id: transcript_id,
    language_confidence: 0.95,
    language_confidence_threshold: 0.03,
    language_model: "no",
    speech_model: null,
    redact_pii: true,
    status: "completed",
    summarization: false,
    webhook_auth: true,
    webhook_auth_header_name: "x-maple-webhook",

    text: utterances.map(u => u.text).join(". "),
    confidence: Number(mean(allWords.map(w => w.confidence)).toFixed(2)),

    utterances,
    words: allWords
  }

  return {
    transcript,
    paragraphs
  }
}

let assemblyInstance: AssemblyAIHandler | AssemblyAIHandlerDummy | undefined

export function assemblyAI(): AssemblyAIHandler | AssemblyAIHandlerDummy {
  if (!assemblyInstance) {
    const apiKey = process.env.ASSEMBLY_API_KEY
    if (!apiKey || apiKey === "test-api-key") {
      console.log("AssemblyAI is faked for this emulator")
      assemblyInstance = new AssemblyAIHandlerDummy()
    } else {
      assemblyInstance = new AssemblyAIHandler({ apiKey })
    }
  }
  return assemblyInstance
}
