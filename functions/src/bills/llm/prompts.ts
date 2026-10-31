/**
 * Prompt templates for the bill summarizer and tagger, ported verbatim from
 * `llm/prompts.py`. Whitespace is part of the prompt (tabs, trailing spaces),
 * so leading tabs are written as `\t` escapes and `prompts.test.ts` compares
 * every template against a fixture rendered from the Python source.
 * Modify these with caution: any change alters model output for every bill.
 *
 * Placeholders use `{name}` and are filled in by `formatPrompt`.
 */

export const SUMMARIZATION_PROMPT_PREFIX = `Can you please explain what the following MA bill means to a regular resident without specialized knowledge?
    Please provide a one paragraph summary in a maximum of 4 sentences. Please be simple, direct and concise for the busy reader.
    Please use politically neutral language, keeping in mind that readers may have various ideological perspectives.
    Make bullet points if possible. 

    Note that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary.`

export const SUMMARIZATION_INSTRUCTIONS = `
\tINSTRUCTIONS: 

\t1. Only provide Summary, no other details are required.
\t2. Do not provide tags or other extraneous text besides the summary.    
\t3. Do not cite the title of the bill - the reader will already know that
\t4. Do not cite specific section, chapter or title numbers of the MGL - the reader will not know what those sections are.
\t5. Do not reference that this is a "MA" or "Massachusetts" bill - the reader will already know that.
\t6. If referencing dates or other provisions of the bill, say that "this would happen if the bill is passed" rather than "this will happen".

\tRESPONSE FORMAT:

\tSummary:`

/** Used when the bill fits in the model's context window. */
export const SUMMARIZATION_PROMPT_SMALL = `
\t${SUMMARIZATION_PROMPT_PREFIX}

\tNote that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary.

\tThe bill title is: \`{title}\`

\tThe bill text is: \`{context}\`

\tThe relevant section names are: \`{names}\`

\tThe relevant section text is: \`{mgl_sections}\`

\tThe relevant committee information if available: \`{committee_info}\`

\t${SUMMARIZATION_INSTRUCTIONS}`

/** Used when the bill is too large and the MGL text is retrieved with RAG. */
export const SUMMARIZATION_PROMPT_LARGE = `
\t${SUMMARIZATION_PROMPT_PREFIX}

\tNote that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary.

\tThe bill title is: {bill_title}

\tThe bill text is: {bill_text}

\tThe relevant section names are: {mgl_names}

\tThe relevant committee information if available: {committee_info}

\t${SUMMARIZATION_INSTRUCTIONS}
\t`

export const TAGGING_INSTRUCTIONS = `
\tINSTRUCTIONS: 
\t1. Choose minimum of 3 tags and no more than 5.
\t2. Do not provide explanations for the tag choices.
\t3. Do not output tags not listed above.
\t4. Do not modify or paraphrase the tag names, choose directly from the list provided.
\t5. Do not assign tags only for the sake of tagging; tag them only if they are relevant.
\t6. Please apply a higher threshold of relevancy to assigning tags. We want to ensure all the tags are relevant.
\t7. Respond with # separated tags.

\tTags: `

export const TAGGING_PROMPT_USING_SUMMARIES = `
\tYour Job here is to identify the tags that can be associated to the following MA Legislative bill. 
\tChoose the closest relevant tags and do not output tags outside of the provided tags. 
\tPlease be politically neutral, keeping in mind that readers may have various ideological perspectives. 
\tBelow is the summary of the bill.
\t
\tThe bill title is: {bill_title}

\tThe bill summary is: {context}

\tList of tags: 
\t- {tags}

\t${TAGGING_INSTRUCTIONS}`

/**
 * Wraps a "large" prompt: `{context}` is the retrieved MGL text and
 * `{question}` is the full prompt. From `large_docs` in `llm/llm_functions.py`
 * (including its "Massachussets" spelling).
 */
export const RAG_PROMPT_TEMPLATE =
  "You are a trustworthy assistant for this task. Use the following pieces of retrieved context to accomplish the job.\n" +
  "        \n" +
  "        Relevant Massachussets General Law section text for context: {context}\n" +
  "\n" +
  "        Bill Details: {question}\n" +
  "\n" +
  "        "

/**
 * Fills `{name}` placeholders in a single pass, so braces inside a substituted
 * value (bill text often contains them) are never reinterpreted. Throws on a
 * placeholder with no value rather than sending a broken prompt to the model.
 */
export const formatPrompt = (
  template: string,
  values: Record<string, string>
): string =>
  template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    if (!(name in values)) {
      throw new Error(`Missing value for prompt placeholder {${name}}`)
    }
    return values[name]
  })
