import { runWith } from "firebase-functions"
import OpenAI from "openai"
import { assignCategoriesToTopics } from "./topicParser"
import { CATEGORIES_BY_TOPIC } from "./types"

const MODEL = "gpt-4o-mini"

const SUMMARIZATION_PROMPT_PREFIX = `Can you please explain what the following MA bill means to a regular resident without specialized knowledge?
    Please provide a one paragraph summary in a maximum of 4 sentences. Please be simple, direct and concise for the busy reader.
    Please use politically neutral language, keeping in mind that readers may have various ideological perspectives.
    Make bullet points if possible. 

    Note that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary.`

const SUMMARIZATION_INSTRUCTIONS = `
	INSTRUCTIONS: 

	1. Only provide Summary, no other details are required.
	2. Do not provide tags or other extraneous text besides the summary.    
	3. Do not cite the title of the bill - the reader will already know that
	4. Do not cite specific section, chapter or title numbers of the MGL - the reader will not know what those sections are.
	5. Do not reference that this is a "MA" or "Massachusetts" bill - the reader will already know that.
	6. If referencing dates or other provisions of the bill, say that "this would happen if the bill is passed" rather than "this will happen".

	RESPONSE FORMAT:

	Summary:`

const SUMMARIZATION_PROMPT = `
	${SUMMARIZATION_PROMPT_PREFIX}

	Note that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary.

	The bill title is: \`{title}\`

	The bill text is: \`{context}\`

	The relevant section names are: \`None\`

	The relevant section text is: \`None\`

	The relevant committee information if available: \`None\`

	${SUMMARIZATION_INSTRUCTIONS}`

const TAGGING_INSTRUCTIONS = `
	INSTRUCTIONS: 
	1. Choose minimum of 3 tags and no more than 5.
	2. Do not provide explanations for the tag choices.
	3. Do not output tags not listed above.
	4. Do not modify or paraphrase the tag names, choose directly from the list provided.
	5. Do not assign tags only for the sake of tagging; tag them only if they are relevant.
	6. Please apply a higher threshold of relevancy to assigning tags. We want to ensure all the tags are relevant.
	7. Respond with # separated tags.

	Tags: `

const TAGGING_PROMPT_USING_SUMMARIES = `
	Your Job here is to identify the tags that can be associated to the following MA Legislative bill. 
	Choose the closest relevant tags and do not output tags outside of the provided tags. 
	Please be politically neutral, keeping in mind that readers may have various ideological perspectives. 
	Below is the summary of the bill.
	
	The bill title is: {bill_title}

	The bill summary is: {context}

	List of tags: 
	- {tags}

	${TAGGING_INSTRUCTIONS}`

const KNOWN_TOPICS = new Set(Object.keys(CATEGORIES_BY_TOPIC))

export function normalizeSummary(summary: string): string {
  const stripped = summary.replace(/^Summary:/, "")
  const lines = stripped.split("\n")
  const cleaned = lines
    .map(line => line.replace(/^- /, "").trim())
    .filter(line => line !== "")
  return cleaned.join(" ")
}

export function parseTags(response: string): string[] {
  return response
    .split("#")
    .map(t => t.trim())
    .filter(t => t !== "" && KNOWN_TOPICS.has(t))
}

function formatPrompt(
  template: string,
  vars: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value)
  }
  return result
}

export async function getSummary(
  client: OpenAI,
  billId: string,
  title: string,
  text: string
): Promise<{ status: number; summary: string }> {
  const prompt = formatPrompt(SUMMARIZATION_PROMPT, {
    title,
    context: text
  })

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }]
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error(
        `failed to generate summary for bill with id \`${billId}\`: empty response`
      )
      return { status: -1, summary: "" }
    }

    return { status: 1, summary: normalizeSummary(content) }
  } catch (error) {
    console.error(
      `failed to generate summary for bill with id \`${billId}\`:`,
      error
    )
    return { status: -1, summary: "" }
  }
}

export async function getTags(
  client: OpenAI,
  billId: string,
  title: string,
  summary: string
): Promise<{ status: number; tags: string[] }> {
  const allTopics = Object.keys(CATEGORIES_BY_TOPIC).join("\n- ")
  const prompt = formatPrompt(TAGGING_PROMPT_USING_SUMMARIES, {
    bill_title: title,
    context: summary,
    tags: allTopics
  })

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }]
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error(
        `failed to generate tags for bill with id \`${billId}\`: empty response`
      )
      return { status: -2, tags: [] }
    }

    const tags = parseTags(content)
    return { status: 1, tags }
  } catch (error) {
    console.error(
      `failed to generate tags for bill with id \`${billId}\`:`,
      error
    )
    return { status: -2, tags: [] }
  }
}

export async function runBillSummaryTrigger(
  snapshot: FirebaseFirestore.DocumentSnapshot,
  context: { params: { bill_id: string } },
  clientOverride?: OpenAI
): Promise<void> {
  const billId = context.params.bill_id
  const data = snapshot.data()

  if (!data) {
    console.log(`bill with id \`${billId}\` has no event data`)
    return
  }

  const client =
    clientOverride ??
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

  let summary: string | undefined = data.summary
  const documentTitle: string | undefined = data.content?.Title
  const documentText: string | undefined = data.content?.DocumentText

  // If the summary is not already populated, generate it
  if (!summary) {
    if (!documentText || !documentTitle) {
      console.log(
        `bill with id \`${billId}\` unable to fetch document text or title`
      )
      return
    }

    const summaryResult = await getSummary(
      client,
      billId,
      documentTitle,
      documentText
    )

    if (summaryResult.status !== 1) {
      console.log(
        `failed to generate summary for bill with id \`${billId}\`, got ${summaryResult.status}`
      )
      return
    }

    summary = summaryResult.summary
    await snapshot.ref.update({ summary })
    console.log(`Successfully updated summary for bill with id \`${billId}\``)
  }

  // If the topics are already populated, we are done
  if (data.topics) {
    console.log(`bill with id \`${billId}\` has topics`)
    return
  }

  const tagsResult = await getTags(client, billId, documentTitle!, summary)

  if (tagsResult.status !== 1) {
    console.log(
      `failed to generate tags for bill with id \`${billId}\`, got ${tagsResult.status}`
    )
    return
  }

  const topics = assignCategoriesToTopics(tagsResult.tags)
  await snapshot.ref.update({ topics })
  console.log(`Successfully updated topics for bill with id \`${billId}\``)
}

export const generateBillSummary = runWith({
  secrets: ["OPENAI_API_KEY"],
  timeoutSeconds: 120,
  memory: "512MB"
})
  .firestore.document("generalCourts/{sessionId}/bills/{bill_id}")
  .onCreate(async (snapshot, context) => {
    await runBillSummaryTrigger(snapshot, context)
  })
