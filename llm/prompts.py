"""
prompts.py

This module contains predefined prompt templates used for various natural language processing tasks
related to legislative bill analysis. These templates are designed to be used with language models
for tasks such as bill summarization, categorization, and tagging.

The module defines several constants:

SUMMARIZATION_PROMPT_PREFIX: Job description for summarization.
SUMMARIZATION_INSTRUCTIONS: Instructions for summarizing bills.
SUMMARIZATION_PROMPT_SMALL: Template for summarizing bills with a standard approach.
SUMMARIZATION_PROMPT_LARGE: Template for summarizing bills using a RAG (Retrieval-Augmented Generation) approach.

CATEGORIZATION_PROMPT_PREFIX: Job description for categorization.
CATEGORIZATION_INSTRUCTIONS: Instructions for categorizing bills.
CATEGORIZATION_PROMPT_SMALL: Template for categorizing bills with a standard approach.
CATEGORIZATION_PROMPT_LARGE: Template for categorizing bills using a RAG approach.

TAGGING_PROMPT_PREFIX: Job description for tagging.
TAGGING_INSTRUCTIONS: Instructions for tagging bills.
TAGGING_PROMPT_SMALL: Template for tagging bills with a standard approach.
TAGGING_PROMPT_LARGE: Template for tagging bills using a RAG approach.

These templates are designed to be used with string formatting to insert specific bill details.
The 'SMALL' variants use placeholders for details to be filled in later, while the 'LARGE' variants
are meant to be formatted with the full text immediately.

Usage:
    Import these constants in other modules where bill analysis tasks are performed.
    Use string formatting to insert specific bill details into the templates.

Note:
    Modify these templates with caution, as changes here will affect all parts of the application
    that use these prompts for bill analysis tasks.
"""

SUMMARIZATION_PROMPT_PREFIX = """Can you please explain what the following MA bill means to a regular resident without specialized knowledge?
    Please provide a one paragraph summary in a maximum of 4 sentences. Please be simple, direct and concise for the busy reader.
    Please use politically neutral language, keeping in mind that readers may have various ideological perspectives.
    Make bullet points if possible. 

    Note that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary."""

SUMMARIZATION_INSTRUCTIONS = """
	INSTRUCTIONS: 

	1. Only provide Summary, no other details are required.
	2. Do not provide tags or other extraneous text besides the summary.    
	3. Do not cite the title of the bill - the reader will already know that
	4. Do not cite specific section, chapter or title numbers of the MGL - the reader will not know what those sections are.
	5. Do not reference that this is a "MA" or "Massachusetts" bill - the reader will already know that.
	6. If referencing dates or other provisions of the bill, say that "this would happen if the bill is passed" rather than "this will happen".

	RESPONSE FORMAT:

	Summary:"""

SUMMARIZATION_PROMPT_SMALL = f"""
	{SUMMARIZATION_PROMPT_PREFIX}

	Note that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary.

	The bill title is: `{{title}}`

	The bill text is: `{{context}}`

	The relevant section names are: `{{names}}`

	The relevant section text is: `{{mgl_sections}}`

	The relevant committee information if available: `{{committee_info}}`

	{SUMMARIZATION_INSTRUCTIONS}"""

SUMMARIZATION_PROMPT_LARGE = f"""
	{SUMMARIZATION_PROMPT_PREFIX}

	Note that the bill refers to specific existing chapters and sections of the Mass General Laws (MGL). Use the corresponding names of Mass General Law chapter and sections for constructing your summary.

	The bill title is: {{bill_title}}

	The bill text is: {{bill_text}}

	The relevant section names are: {{mgl_names}}

	The relevant committee information if available: {{committee_info}}

	{SUMMARIZATION_INSTRUCTIONS}
	"""

CATEGORIZATION_PROMPT_PREFIX = """Your job is to classify the bill according to the list of categories below. 
	Choose the closest relevant category and do not output categories outside of this list. 
	Please be politically neutral, keeping in mind that readers may have various ideological perspectives. 
	Use the information from specified chapters and sections of the Mass General Laws to categorize the bill."""

CATEGORIZATION_INSTRUCTIONS = """
	INSTRUCTIONS: 
	1. Choose just 2 categories from the list above.
	2. Do not provide explanations for the category choices.
	3. Do not output categories not listed above.
	4. Do not modify or paraphrase the category names, choose directly from the list provided.
	5. Respond with # separated categories
"""

CATEGORIZATION_PROMPT_SMALL = f"""
	{CATEGORIZATION_PROMPT_PREFIX}

	List of Categories:
	{{categories}}

	Note that the bill refers to specific existing chapters and sections of the Mass General Laws. Use the corresponding names of Mass General Law chapter and sections for choosing the categories.

	The bill title is: `{{title}}`

	The bill text is: `{{context}}`

	The relevant committee information: `{{committee_info}}`

	The relevant section names are: `{{names}}`

	The relevant section text is: `{{mgl_sections}}`

	{CATEGORIZATION_INSTRUCTIONS}

	Categories: """

CATEGORIZATION_PROMPT_LARGE = f"""
	{CATEGORIZATION_PROMPT_PREFIX}

	List of Categories: 
	{{categories}}

	Note that the bill refers to specific existing chapters and sections of the Mass General Laws. Use the corresponding names of Mass General Law chapter and sections for choosing the categories.

	The bill title is: {{bill_title}}

	The bill text is: {{bill_text}}

	The relevant committee information: {{committee_info}}

	The relevant section names are: {{mgl_names}}

	{CATEGORIZATION_INSTRUCTIONS}

	Categories: """

TAGGING_PROMPT_PREFIX = """Your Job here is to identify the tags that can be associated to the following MA Legislative bill. 
	Choose the closest relevant tags and do not output tags outside of the provided tags. 
	Please be politically neutral, keeping in mind that readers may have various ideological perspectives. 
	Note that the bill refers to specific existing chapters and sections of the Mass General Laws. Use the information from those chapters and sections in your context for tagging."""

TAGGING_INSTRUCTIONS = """
	INSTRUCTIONS: 
	1. Choose minimum of 3 tags and no more than 5.
	2. Do not provide explanations for the tag choices.
	3. Do not output tags not listed above.
	4. Do not modify or paraphrase the tag names, choose directly from the list provided.
	5. Do not assign tags only for the sake of tagging; tag them only if they are relevant.
	6. Please apply a higher threshold of relevancy to assigning tags. We want to ensure all the tags are relevant.
	7. Respond with # separated tags.

	Tags: """

TAGGING_PROMPT_SMALL = f"""
	{TAGGING_PROMPT_PREFIX}

	List of tags: 
	- {{category_tags}}

	The bill title is: `{{title}}`

	The bill text is: `{{context}}`

	The relevant committee information: `{{committee_info}}`

	The relevant section names are: `{{names}}`

	The relevant section text is: `{{mgl_sections}}`

	{TAGGING_INSTRUCTIONS}"""

TAGGING_PROMPT_LARGE = f"""
	{TAGGING_PROMPT_PREFIX}

	List of tags: 
	- {{category_tags}}

	The bill title is: {{bill_title}}

	The bill text is: {{bill_text}}

	The relevant committee information: {{committee_info}}

	The relevant section names are: {{mgl_names}}

	{TAGGING_INSTRUCTIONS}"""

TAGGING_PROMPT_USING_SUMMARIES = f"""
	Your Job here is to identify the tags that can be associated to the following MA Legislative bill. 
	Choose the closest relevant tags and do not output tags outside of the provided tags. 
	Please be politically neutral, keeping in mind that readers may have various ideological perspectives. 
	Below is the summary of the bill.
	
	The bill title is: {{bill_title}}

	The bill summary is: {{context}}

	List of tags: 
	- {{tags}}

	{TAGGING_INSTRUCTIONS}"""
