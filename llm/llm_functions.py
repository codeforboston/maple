"""
This code implements text summarization, category selection and tagging bills using templated LLM prompts.

The main functions and their objectives are:
1. get_summary_api_function: Function used to summarize a bill - It takes in bill id, bill title and bill text
                            and returns summary of the bill.

2. get_tags_api_function:    Function used to tag a bill with pre specified tags - It takes in bill id, bill title
                            and bill text and returns the selected tags from specified tags.

3. get_summaries_and_tags_api_function: Combined function that generates both summary and tags in a single call -
                            It takes in bill id, bill title and bill text, first generates a summary, and then
                            uses this summary to generate relevant tags. This approach ensures tags are based on
                            the distilled information in the summary rather than the full bill text.

4. get_tags_api_function_v2: Optimized version of tag generation that works with bill summaries - It takes in
                            bill id, bill title and bill summary (instead of full text) to generate tags. This
                            version provides more focused tagging by working with already-distilled information.

Note:
    - All functions return standardized response objects with status codes indicating success or specific failure modes
    - The v2 functions represent an improved approach that uses bill summaries for more efficient and accurate tagging
    - Templates for prompts are maintained separately to ensure consistency across different parts of the application

"""

import numpy as np
import pandas as pd
import tiktoken
import chromadb
import re
import requests

from dataclasses import dataclass, field

from langchain.globals import set_llm_cache
from langchain.prompts import PromptTemplate
from langchain_community.cache import SQLiteCache
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from langchain_community.callbacks import get_openai_callback
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain_text_splitters import TokenTextSplitter
from langchain.docstore.document import Document
from langchain.chains.combine_documents import create_stuff_documents_chain

from operator import itemgetter
from pathlib import Path
from requests.exceptions import RequestException
from typing import List
from requests.packages.urllib3.exceptions import InsecureRequestWarning

from prompts import (
    TAGGING_PROMPT_LARGE,
    TAGGING_PROMPT_SMALL,
    CATEGORIZATION_PROMPT_SMALL,
    SUMMARIZATION_PROMPT_SMALL,
    CATEGORIZATION_PROMPT_LARGE,
    SUMMARIZATION_PROMPT_LARGE,
    TAGGING_PROMPT_USING_SUMMARIES,
)
from tag_categories import (
    new_categories_for_bill_list,
    new_tags,
    new_tags_for_bill_dict,
)

from normalize_summaries import normalize_summary

GPT_MDOEL_VERSION = "gpt-4o-mini"
MAX_TOKEN_LIMIT = 128000

CHROMA_DB_PATH = "./databases/chroma_db"
LLM_CACHE = Path("./databases/llm_cache.db")

API_KEY = ""  # Optional: Add API Key here if you want to use legacy functions


def extract_sections(bill_text: str) -> list[tuple[str, str]]:
    """
    Extracts chapters and sections from a bill using regular expressions.

    Parameters:
    - bill_text (str): The text of the bill containing chapters and sections.

    Returns:
    - lists_with_both: A list of lists containing pairs of chapters and sections extracted from the bill.
    """
    regex = ""
    chapter = ""
    section = ""

    check_list = ["section", "chapter"]
    # Regex to extract strings containing "section# of chapter#, 'section# of said chapter#' , 'section#' or 'chapter#' in a list
    regex = re.findall(
        r"(section)(\s+\d+[a-zA-Z]+|\s+\d+)\s+(of|of\ssaid)\s(chapter)(\s+\d+[a-zA-Z]+|\s\d+)|(section|chapter)(\s+\d+[a-zA-Z]+|\s\d+)",
        str(bill_text),
        re.IGNORECASE,
    )

    lists_with_both = []
    current_chapter = ""

    # iterate over regex list that contains both chapters and sections
    for x in regex:
        items = []
        # iterate over extracted lists
        for item in x:
            item = item.casefold()
            items.append(item)
        if all(name in items for name in check_list):
            for i, j in enumerate(x):
                if j.casefold() == "section":
                    section = x[i + 1].strip()

                if j.casefold() == "chapter":
                    chapter = x[i + 1].strip()

                    # save current chapter in order to use it for pairing with sections mentioned later
                    current_chapter = chapter

                    # add chapter and section to the list
                    list_with_both = [chapter, section]

                    # only keep new/unique chapter and section pairs
                    if list_with_both not in lists_with_both:
                        lists_with_both.append(list_with_both)

        else:
            # iterate over list that contains only sections or chapters
            for i, j in enumerate(x):
                # ignore SECTION with caps as it indicates sections from the bills and not the MGL
                if j == "SECTION":
                    continue
                if j == "":
                    continue

                else:
                    if j.casefold() == "chapter":
                        current_chapter = x[
                            i + 1
                        ].strip()  # keep track of current chapter

                    if j.casefold() == "section":
                        if x[i + 1] == "":
                            continue
                        else:
                            section = x[i + 1].strip()

                        list_with_both = [current_chapter, section]
                        if list_with_both not in lists_with_both:
                            lists_with_both.append(list_with_both)

    return lists_with_both


def query_section_text(chapter_section_list: tuple[str, str]) -> str | float:
    """
    Makes an API call to retrieve text data based on the provided chapter and section.

    Parameters:
    - chapter_section_list (list): A list containing two elements - chapter and section, e.g., ['2', '15D'].

    Returns:
    - result (str): The text data retrieved from the API.

    Note:
    - This function uses the malegislature.gov API to fetch text data for a specific chapter and section.

    """

    result = """"""

    try:
        # unpack section and chapter for example: ['2', '15D']
        chapter, section = chapter_section_list
        link = f"https://malegislature.gov/api/Chapters/{chapter}/Sections/{section}"
        r = requests.get(link, verify=False)
        r = r.json()

        # fields to extract
        result = r.get("Text", np.nan)

        return result
    except RequestException:
        pass


def query_section_text_all_bills(
    chapter_section_lists: list[tuple[str, str]],
) -> tuple[list[str], list[tuple[str, str]]]:
    """
    Retrieves text data for each chapter-section pair in the given sample; prints chapter-section numbers to keep track of the progress.

    Parameters:
    - sample (list): A list of chapter-section pairs.

    Returns:
    - formatted_data(list): A list containing formatted text data for each non-empty chapter-section pair in the sample.
    - empty_responses(list): A list containing chapter section pairs where API doesn't return anything

    Note:
    - This function prints the provided chapter-section pairs and retrieves text data for each pair using the `make_api_call` function.
    - The function skips empty or None pairs and ignores pairs with empty or NaN text data.
    - The formatted text data for each non-empty pair is stored in a list, which is then returned.
    """

    # Storing and printing each pair
    requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    formatted_data = []
    empty_responses = []
    result = """"""
    if len(str(chapter_section_lists)) == 0:
        return

    if str(chapter_section_lists) == "nan":
        return

    # Iterate through each pair in the chapter_section_lists
    for pair in chapter_section_lists:
        if len(pair) == 0:
            continue
        else:
            string = query_section_text(pair)
            if string in {None, np.nan, "", "nan"}:
                empty_responses.append(
                    pair
                )  # get a list of chapter-section pair where the API call returns an empty list
                continue
            else:
                result += string
        formatted_data.append(result)

    return formatted_data, empty_responses


def get_chap_sec_names_internal(
    chap_sec_lists: list, mgl_names_file_path: str = "./chapter_section_names.pq"
) -> str:
    """
    Fetches chapter and section names for a given bill number from a local parquet file.
    TODO delete this function after we setup a robust database backend with the MGL data.

    Args:
        chap_sec_lists (list): list of tuples containing chapter number and section numbers.
        mgl_names_file_path (str): path for the file containing chapter and section names. Expected columns are `Chapter_Number`, `Section_Number`, `Chapter`, `Section Name`

    Returns:
        str: All chapter and section names pairs concatenated together.

    The function assumes the DataFrame has the necessary columns.
    """

    names_df = pd.read_parquet(mgl_names_file_path)
    names = {}

    # for lists in chap_sec_lists:
    for tup in chap_sec_lists:
        chap, sec = tup
        try:
            chapter_name = names_df[
                (names_df["Chapter_Number"] == chap)
                & (names_df["Section_Number"] == sec)
            ]["Chapter"].values[0]
            section_name = names_df[
                (names_df["Chapter_Number"] == chap)
                & (names_df["Section_Number"] == sec)
            ]["Section Name"].values[0]
            names[chapter_name] = section_name
        except Exception:
            continue

    return ", ".join([f"{key}: {value}" for key, value in names.items()])


def count_tokens(
    bill_title: str, bill_text: str, mgl_ref: str, mgl_names: str, committee_info: str
):
    """
    Outputs the number of tokens for the given documents

    Args:
        bill_title (str): Title of the bill.
        bill_text (str): Text content of the bill
        mgl_ref (str):  Mass General Law Section text, if any.
        mgl_names (str): List of Mass General Law chapter and section names
        committee_info (str): Committee name and description

    Returns:
        int: token_count
    """

    encoding = tiktoken.encoding_for_model(GPT_MDOEL_VERSION)

    text = (
        str(bill_title)
        + str(bill_text)
        + str(mgl_ref)
        + str(mgl_names)
        + str(committee_info)
    )
    token_count = len(encoding.encode(text))
    print(f"The text contains {token_count} tokens.")
    return token_count


def set_my_llm_cache(cache_file: Path = LLM_CACHE) -> SQLiteCache:
    """
    Set an LLM cache, which allows for previously executed completions to be
    loaded from disk instead of repeatedly queried.
    """
    cache_file.parent.mkdir(exist_ok=True)
    set_llm_cache(SQLiteCache(database_path=cache_file))


@dataclass()
class BillDetails:
    """
    A class to store all the details pertaining to a bill.
    """

    bill_id: str = ""
    bill_title: str = ""
    bill_text: str = ""
    mgl_ref: str = ""
    committee_info: str = ""
    mgl_names: str = ""
    invoke_dict: dict = field(default_factory=list)
    summary: str = ""


@dataclass()
class LLMResults:
    """
    A class to store the results of the LLM.
    """

    query: str = ""
    response: str = ""


def extract_bill_context(bill_text: str) -> tuple:
    """
    This function takes in bill text, extracts the referenced MGL sections and returns them

    Arguments:
        bill_text (str): Actual bill text

    Returns:
        A tuple of (combined_mgl, mgl_names)
        combined_mgl (str): All the relevant MGL section strings concatenated to a big string
        mgl_names (tuple): Tuple of referenced MGL section numbers
    """
    sections = extract_sections(bill_text)
    mgl_list, empty_responses = query_section_text_all_bills(sections)

    combined_mgl = " ".join(mgl_list) if len(mgl_list) != 0 else "None"
    mgl_names = get_chap_sec_names_internal(sections)

    return combined_mgl, mgl_names


def get_summaries_and_tags_api_function(
    bill_id: str, bill_title: str, bill_text: str
) -> dict:
    """
    Generates both a summary and relevant tags for a given legislative bill in a single API call.

    This function processes the bill in two steps:
    1. Generates a summary of the bill using get_summary_api_function
    2. Uses this summary to generate relevant tags using get_tags_api_function_v2

    The sequential processing ensures that tags are generated based on the distilled
    information in the summary rather than the full bill text, potentially improving
    tagging accuracy and consistency.

    Args:
        bill_id (str): The unique identifier of the bill.
        bill_title (str): The title of the bill.
        bill_text (str): The full text content of the bill.

    Returns:
        dict: A dictionary containing:
            - 'status' (int): Indicates the processing status:
               * 1: Both summary and tags generated successfully
               * -1: Failed to generate summary
               * -2: Failed to generate tags
            - 'summary' (str): The generated summary if successful, empty string otherwise
            - 'tags' (list): List of generated tags if successful, empty list otherwise

    Process:
        1. Attempts to generate a summary using get_summary_api_function
        2. If summary generation succeeds, proceeds to generate tags using get_tags_api_function_v2
        3. If either step fails, returns appropriate status code and partial results

    Note:
        - The function uses get_tags_api_function_v2 which is optimized to work with
         bill summaries rather than full bill text
        - If summary generation fails, tag generation is not attempted
    """

    response_obj = {"status": -1, "summary": "", "tags": []}

    # Get the summary
    summary_response = get_summary_api_function(bill_id, bill_title, bill_text)

    response_obj.update(summary_response)

    if response_obj["summary"] == "" or response_obj["status"] != 1:
        return response_obj

    # Get tags
    tags_response = get_tags_api_function_v2(
        bill_id, bill_title, response_obj["summary"]
    )
    response_obj.update(tags_response)
    return response_obj


def get_summary_api_function(bill_id: str, bill_title: str, bill_text: str) -> dict:
    """
    Generates a summary for a given legislative bill.

    This function processes the input bill information, extracts relevant context from the
    Massachusetts General Laws (MGL), and uses a language model to generate a concise summary.

    Args:
        bill_id (str): The unique identifier of the bill.
        bill_title (str): The title of the bill.
        bill_text (str): The full text content of the bill.

    Returns:
        dict: A dictionary containing:
            - 'status' (int): 1 if successful, -1 if necessary details were not found.
            - 'summary' (str): The generated summary of the bill if successful, empty string otherwise.

    Process:
        1. Extracts relevant MGL sections referenced in the bill.
        2. Creates a BillDetails object with bill information and extracted MGL context.
        3. Calls the get_summary function to generate the summary using a language model.

    Note:
        The function relies on external functions like extract_bill_context and get_summary,
        which should be properly implemented and available in the same scope.

    Raises:
        Any exceptions raised by the called functions (e.g., extract_bill_context, get_summary)
        are not caught here and will propagate to the caller.
    """
    # extract relevant mgl text
    combined_mgl, mgl_names = extract_bill_context(bill_text)

    # create bill_details object
    bill_details = BillDetails(
        bill_id=bill_id,
        bill_title=bill_title,
        bill_text=bill_text,
        mgl_ref=combined_mgl,
        committee_info="None:None",
        mgl_names=mgl_names,
    )

    # call the summary function
    status_code, results = get_summary(bill_details)

    # return response attribute of returned value
    if status_code != 1:
        return {"status": status_code, "summary": ""}
    else:
        return {"status": status_code, "summary": normalize_summary(results.response)}


def get_tags_api_function(bill_id: str, bill_title: str, bill_text: str) -> dict:
    """
    Generates relevant tags for a given legislative bill.

    This function processes the input bill information, extracts relevant context from the
    Massachusetts General Laws (MGL), and uses a language model to generate appropriate tags.

    Args:
        bill_id (str): The unique identifier of the bill.
        bill_title (str): The title of the bill.
        bill_text (str): The full text content of the bill.

    Returns:
        dict: A dictionary containing:
            - 'status' (int): 1 if successful, -1 if necessary details were not found.
            - 'tags' (list): A list of generated tags if successful, empty list otherwise.

    Process:
        1. Extracts relevant MGL sections referenced in the bill.
        2. Creates a BillDetails object with bill information and extracted MGL context.
        3. Calls the get_tags function to generate tags using a language model.

    Note:
        The function relies on external functions like extract_bill_context and get_tags,
        which should be properly implemented and available in the same scope.

    Raises:
        Any exceptions raised by the called functions (e.g., extract_bill_context, get_tags)
        are not caught here and will propagate to the caller.
    """

    # extract relevant mgl text
    combined_mgl, mgl_names = extract_bill_context(bill_text)

    # create bill_details object
    bill_details = BillDetails(
        bill_id=bill_id,
        bill_title=bill_title,
        bill_text=bill_text,
        mgl_ref=combined_mgl,
        committee_info="None:None",
        mgl_names=mgl_names,
    )

    # call the summary function
    status_code, results = get_tags(bill_details)

    # return response attribute of returned value
    if status_code != 1:
        return {"status": status_code, "tags": []}
    else:
        return {"status": status_code, "tags": results.response}


def get_tags_api_function_v2(bill_id: str, bill_title: str, bill_summary: str) -> dict:
    """
    Generates tags for a legislative bill using its summary instead of full text.

    This version (v2) of the tag generation API offers a more streamlined approach by working
    with bill summaries rather than full bill text. This approach potentially provides more
    focused and relevant tags as it works with already-distilled information.

    Args:
       bill_id (str): The unique identifier of the bill.
       bill_title (str): The title of the bill.
       bill_summary (str): A summarized version of the bill's content, typically
                          generated by get_summary_api_function.

    Returns:
       dict: A dictionary containing:
           - 'status' (int): Indicates the processing status:
               * 1: Tags generated successfully
               * -2: Failed to generate tags or necessary details not found
           - 'tags' (list): List of generated tags if successful, empty list otherwise

    Process:
       1. Creates a BillDetails object with bill ID, title, and summary
       2. Calls get_tags_v2 to generate tags based on the summary
       3. Formats and returns the results

    Note:
       - This function is optimized to work with bill summaries rather than full bill text,
         making it more efficient and potentially more accurate than the original version
       - It is commonly used in conjunction with get_summary_api_function as part of a
         combined summary and tagging pipeline
       - The function uses an alternative tagging method (get_tags_v2) specifically
         designed to work with summarized content
    """

    bill_details = BillDetails(
        bill_id=bill_id, bill_title=bill_title, summary=bill_summary
    )
    status_code, results = get_tags_v2(bill_details)

    if status_code != 1:
        return {"status": status_code, "tags": []}
    else:
        return {"status": status_code, "tags": results.response}


def get_llm_call_type(bill_details: BillDetails) -> str:
    """
    This function calculates number of tokens and decides on weather to use RAG or not. It reutrns a string output
    that specifies how to call the LLM.

    Args:
        bill_details (BillDetails): object consisting of bill_text, bill_title, mgl_ref, commottee_info, mgl_names

    Returns:
        str: 'large' or 'small' depeneding upon token count

    """

    bill_text = getattr(bill_details, "bill_text")
    bill_title = getattr(bill_details, "bill_title")
    mgl_ref = getattr(bill_details, "mgl_ref")
    committee_info = getattr(bill_details, "committee_info")
    mgl_names = getattr(bill_details, "mgl_names")

    num_tokens = count_tokens(bill_title, bill_text, mgl_ref, mgl_names, committee_info)

    return "small" if num_tokens < MAX_TOKEN_LIMIT - 5000 else "large"


def get_category_tags(categories: List) -> List:
    """
    This function takes in list of categories and returns tags pertinant to that specifc categories only.

    Args:

        categories (List(str)): List of category strings.

    Returns:
        List of all tags specific to those of categories.
    """

    tags_tuple = itemgetter(
        *set.intersection(set(categories), set(new_categories_for_bill_list))
    )(new_tags_for_bill_dict)

    if isinstance(tags_tuple, list):
        return tags_tuple

    category_tags = []
    for cts in tags_tuple:
        category_tags += cts
    return category_tags


def get_summary(bill_details: BillDetails) -> tuple[int, LLMResults]:
    """
    This function takes in bill details object (bill title, bill text and reference mgl section text) and summarizes the bill.

    Arguments:

    bill_details (BillDetails): Object containing information about the bill - bill_text, bill_title, mgl_ref, commottee_info, mgl_names

    Returns:
        A tuple of status_code and an LLMResults object containing query, response from the LLM
        status_code can take these following values {1: Success, -1: Necessary details not found}

    """

    if not all(
        hasattr(bill_details, attr)
        for attr in ("bill_text", "bill_title", "mgl_names", "committee_info")
    ):
        return -1, LLMResults()

    set_my_llm_cache()
    llm_call_type = get_llm_call_type(bill_details)

    query = get_query_for_summarization(bill_details, llm_call_type)
    return 1, call_llm(bill_details, query, llm_call_type)


def get_tags(bill_details: BillDetails) -> tuple[int, LLMResults]:
    """
    Tags a legislative bill using a two-step process involving categorization and LLM-based tag selection.

    This function processes the given bill details through two stages:
    1. Categorization: The bill is classified into specified categories, and tags relevant to these categories are shortlisted.
    2. Tag Selection: An LLM is prompted to choose the most appropriate tags from the shortlisted set.

    This method has been chosen based on extensive experimentation and effective evaluation.

    Args:
        bill_details (BillDetails): An object containing comprehensive information about the bill, including:
            - bill_text: The full text of the bill
            - bill_title: The title of the bill
            - mgl_ref: Reference to the Massachusetts General Laws section
            - committee_info: Information about the committee handling the bill
            - mgl_names: Names of relevant Massachusetts General Laws sections

    Returns:
        Tuple[int, LLMResults]: A tuple containing:
            - status_code (int): Indicates the outcome of the tagging process
                1: Success
               -1: Necessary details not found
            - LLMResults: An object containing the query and the LLM's response

    Note:
        The function requires all necessary bill details to be present in the BillDetails object for successful execution.
    """

    if not all(
        hasattr(bill_details, attr)
        for attr in ("bill_text", "bill_title", "mgl_names", "committee_info")
    ):
        return -1, LLMResults()

    set_my_llm_cache()
    llm_call_type = get_llm_call_type(bill_details)

    query_1 = get_query_for_categorizing(bill_details, llm_call_type)
    category_response = call_llm(bill_details, query_1, llm_call_type)
    categories = extract_categories_tags(category_response.response)
    category_tags = get_category_tags(categories)

    # for cat, tags in new_tags_for_bill_dict.items(): category_tags += tags
    query_2 = get_query_for_tagging(bill_details, category_tags, llm_call_type)
    tag_response = call_llm(bill_details, query_2, llm_call_type)

    # parses the response from LLM and removes hallucinated tags
    tag_response.response = list(
        set(extract_categories_tags(tag_response.response)) & set(category_tags)
    )

    return 1, tag_response


def get_tags_v2(bill_details: BillDetails) -> LLMResults:
    """
    Helper function that generates tags for a bill using its summary.

    This optimized version of the tagging function works directly with bill summaries
    instead of full bill text. It uses a predefined prompt template specifically designed
    for processing summarized content.

    Args:
       bill_details (BillDetails): Object containing bill information, must include:
           - summary: Summarized content of the bill
           - bill_title: Title of the bill

    Returns:
       tuple[int, LLMResults]: A tuple containing:
           - int: Status code indicating the operation result:
               * 1: Tags generated successfully
               * -2: Required bill details missing
           - LLMResults: Object containing the query and response from the LLM.
                        Response contains a list of generated tags if successful.

    Process:
       1. Validates presence of required bill attributes
       2. Sets up LLM cache for efficient processing
       3. Prepares the input dictionary with bill summary and title
       4. Calls the language model with a summary-specific prompt
       5. Filters generated tags to ensure they exist in predefined tag set

    Note:
       - Uses 'small' LLM call type as summaries are typically compact
       - Automatically deduplicates tags using set operations
       - Validates generated tags against a predefined set of allowed tags
       - Relies on TAGGING_PROMPT_USING_SUMMARIES template from prompts.py
    """

    if not all(hasattr(bill_details, attr) for attr in ("summary", "bill_title")):
        return -2, LLMResults()

    set_my_llm_cache()
    llm_call_type = "small"
    query = TAGGING_PROMPT_USING_SUMMARIES
    bill_details.invoke_dict = {
        "bill_title": bill_details.bill_title,
        "context": [Document(page_content=f"```{bill_details.summary}```")],
        "tags": new_tags,
    }

    tag_response = call_llm(bill_details, query, llm_call_type)
    tag_response.response = list(
        set(extract_categories_tags(tag_response.response)) & set(new_tags)
    )
    return 1, tag_response


def extract_categories_tags(response: str) -> list:
    """
    Extracts categories or tags from a string response.

    This function takes a string response where categories or tags are separated by '#' symbols,
    splits the string at these separators, and returns a list of cleaned (stripped) categories or tags.

    Args:
        response (str): A string containing categories or tags separated by '#' symbols.

    Returns:
        List[str]: A list of extracted categories or tags, with leading and trailing whitespace removed.

    Example:
        >>> extract_categories_tags("Category1 # Category2 #Tag1# Tag2 ")
        ['Category1', 'Category2', 'Tag1', 'Tag2']

    Note:
        This function assumes that the input string uses '#' as a delimiter between categories or tags.
        Empty elements (resulting from consecutive '#' characters) will be removed from the final list.
    """

    response = response.split("#")
    return [i.strip() for i in response]


def prepare_invoke_dict(bill_details: BillDetails) -> dict:
    """
    This function prepares the dict object that is used in chain.invoke function to call the LLM with prompt and
    required details.

    Args:
        bill_details (BillDetails): Object containing information about the bill - bill_text, bill_title, mgl_ref, commottee_info, mgl_names

    Returns:
        dict object containing all the necessary keys and values required for invoke call.

    """
    text_splitter = CharacterTextSplitter(chunk_size=90000, chunk_overlap=1000)

    return {
        "title": bill_details.bill_title,
        "context": [
            Document(page_content=f"```{x}```")
            for x in text_splitter.split_text(bill_details.bill_text)
        ],
        "names": bill_details.mgl_names,
        "mgl_sections": [
            Document(page_content=f"```{x}```")
            for x in text_splitter.split_text(bill_details.mgl_ref)
        ],
        "committee_info": bill_details.committee_info,
    }


def get_query_for_summarization(bill_details: BillDetails, llm_call_type: str) -> str:
    """
    Prepares a prompt for bill summarization based on the specified LLM call type.

    This function constructs a query string for summarizing a legislative bill. It uses
    predefined templates for small and large LLM call types, ensuring consistency across
    different parts of the application.

    Args:
        bill_details (BillDetails): Object containing bill information. This object may
                                    be modified in place for 'small' call types.
        llm_call_type (str): Specifies the type of LLM call to make.
                             Can be either "small" (standard approach) or "large" (RAG approach).

    Returns:
        str: A formatted query string containing the task description, context, and instructions
             for bill summarization.

    Note:
        If llm_call_type is 'small', this function will update the `invoke_dict` attribute of
        the `bill_details` object.
    """

    if llm_call_type == "large":
        query = SUMMARIZATION_PROMPT_LARGE.format(
            bill_title=getattr(bill_details, "bill_title"),
            bill_text=getattr(bill_details, "bill_text"),
            mgl_names=getattr(bill_details, "mgl_names"),
            committee_info=getattr(bill_details, "committee_info"),
        )
    else:
        bill_details.invoke_dict = prepare_invoke_dict(bill_details)
        query = SUMMARIZATION_PROMPT_SMALL

    return query


def get_query_for_categorizing(bill_details: BillDetails, llm_call_type: str) -> str:
    """
    Prepares a prompt for bill categorization based on the specified LLM call type.

    This function constructs a query string for categorizing a legislative bill. It uses
    predefined templates for small and large LLM call types, ensuring consistency across
    different parts of the application.

    Args:
        bill_details (BillDetails): Object containing bill information. This object may
                                    be modified in place for 'small' call types.
        llm_call_type (str): Specifies the type of LLM call to make.
                             Can be either "small" (standard approach) or "large" (RAG approach).

    Returns:
        str: A formatted query string containing the task description, context, and instructions
             for bill categorization.

    Note:
        If llm_call_type is 'small', this function will update the `invoke_dict` attribute of
        the `bill_details` object inplace.
    """

    if llm_call_type == "large":
        query = CATEGORIZATION_PROMPT_LARGE.format(
            categories=getattr(
                bill_details, "categories", new_categories_for_bill_list
            ),
            bill_title=getattr(bill_details, "bill_title"),
            bill_text=getattr(bill_details, "bill_text"),
            committee_info=getattr(bill_details, "committee_info"),
            mgl_names=getattr(bill_details, "mgl_names"),
        )
    else:
        query = CATEGORIZATION_PROMPT_SMALL
        bill_details.invoke_dict = prepare_invoke_dict(bill_details)
        bill_details.invoke_dict["categories"] = getattr(
            bill_details, "categories", new_categories_for_bill_list
        )

    return query


def get_query_for_tagging(
    bill_details: BillDetails, category_tags: list, llm_call_type: str
) -> str:
    """
    Prepares a prompt for bill tagging based on the specified LLM call type.

    This function constructs a query string for tagging a legislative bill. It uses
    predefined templates for small and large LLM call types, ensuring consistency across
    different parts of the application.

    Args:
        bill_details (BillDetails): Object containing bill information. This object may
                                    be modified in place for 'small' call types.
        category_tags (list): List of tags that the model has to filter from.
        llm_call_type (str): Specifies the type of LLM call to make.
                             Can be either "small" (standard approach) or "large" (RAG approach).

    Returns:
        str: A formatted query string containing the task description, context, and instructions
             for bill tagging.

    Note:
        If llm_call_type is 'small', this function will update the `invoke_dict` attribute of
        the `bill_details` object.
    """

    if llm_call_type == "large":
        query = TAGGING_PROMPT_LARGE.format(
            category_tags=", ".join(category_tags),
            bill_title=getattr(bill_details, "bill_title"),
            bill_text=getattr(bill_details, "bill_text"),
            committee_info=getattr(bill_details, "committee_info"),
            mgl_names=getattr(bill_details, "mgl_names"),
        )

    else:
        query = TAGGING_PROMPT_SMALL
        bill_details.invoke_dict = prepare_invoke_dict(bill_details)
        bill_details.invoke_dict["category_tags"] = category_tags

    return query


def call_llm(
    bill_details: BillDetails, query: str, llm_call_type: str = "small"
) -> LLMResults:
    """

    This is a generic function that calls the LLM with given query

    Args:
        bill_details (BillDetails): Object containing information about the bill - bill_text, bill_title, mgl_ref, commottee_info, mgl_names
        query (str): Query string containing details on what model has to do.
        llm_call_type (str): This argument can take 2 values ("small": No use of RAG, "large": Use RAG)

    Returns:
        LLMResults: Object containing query, response (Raw unformatted response from model) and metrics (If requested)

    """

    llm = ChatOpenAI(temperature=0, model=GPT_MDOEL_VERSION, model_kwargs={"seed": 42})

    if llm_call_type == "small":
        response = small_docs(bill_details, query, llm)
    else:
        response = large_docs(bill_details, query, llm)

    return_obj = LLMResults(query=query, response=response)

    return return_obj


def small_docs(bill_details: BillDetails, query: str, llm: ChatOpenAI) -> str:
    """

    This function calls the LLM without using RAG - Generally used if token count is less than 128k

    Args:
        bill_details (BillDetails): Object containing information about the bill - bill_text, bill_title, mgl_ref, commottee_info, mgl_names
        query (str): Query string containing details on what model has to do.
        llm (ChatOpenAI): LLM call object

    Returns:
        (str): Raw response of the LLM.

    """

    prompt = PromptTemplate.from_template(query)
    chain = create_stuff_documents_chain(llm, prompt)
    with get_openai_callback() as _cb:
        response = chain.invoke(bill_details.invoke_dict)

    return response


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def get_or_create_embeddings(
    bill_details: BillDetails, emb_api: OpenAIEmbeddings
) -> chromadb.PersistentClient:
    """
    Retrieves existing embeddings or creates new ones for a given bill.

    This function checks if embeddings for a specific bill already exist in the Chroma database.
    If they don't exist, it creates new embeddings using the provided OpenAI Embeddings API.

    Args:
        bill_details (BillDetails): An object containing details about the bill, including its ID and text.
        emb_api (OpenAIEmbeddings): An instance of the OpenAI Embeddings API for creating embeddings.

    Returns:
        chromadb.PersistentClient: A client instance for the Chroma database where embeddings are stored.

    Notes:
        - The function uses a persistent Chroma database located at CHROMA_DB_PATH.
        - If embeddings for the bill don't exist, it creates them using a TokenTextSplitter
          with a chunk size of 2000 and overlap of 200.
        - New embeddings are added to the database with metadata including the bill ID.

    Raises:
        Any exceptions raised by Chroma operations or the embedding process are not caught
        and will propagate to the caller.
    """

    bill_id = bill_details.bill_id
    client = chromadb.PersistentClient(CHROMA_DB_PATH)
    collection = client.get_or_create_collection(name="bills_collection")

    existing_docs = collection.get(where={"bill_id": bill_id})

    if not existing_docs["ids"]:
        # print(f"Creating new embeddings for bill {bill_id}")

        # The text is split into 2000-token chunks for two primary purposes:
        # 1. Enhanced Retrieval Precision: Smaller chunks create more granular embeddings,
        #    enabling more accurate similarity matching during retrieval.
        # 2. Optimal Context Utilization: Smaller chunks allow for more efficient use of
        #    the model's context window, as opposed to larger chunks that might contain
        #    irrelevant information and waste context space.
        text_splitter = TokenTextSplitter.from_tiktoken_encoder(
            chunk_size=2000, chunk_overlap=200
        )

        if len(bill_details.mgl_ref) > 1e06:
            bill_details.mgl_ref = bill_details.mgl_ref[:1000000]

        documents = text_splitter.split_text(bill_details.mgl_ref)

        embeddings = emb_api.embed_documents(documents)

        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=[{"bill_id": bill_id} for _ in documents],
            ids=[f"{bill_id}_{i}" for i in range(len(documents))],
        )
    return client


def large_docs(bill_details: BillDetails, query: str, llm: ChatOpenAI) -> str:
    """

    This function calls the LLM using RAG - Generally used if token count is greater than 128k

    Args:
        bill_details (BillDetails): Object containing information about the bill - bill_text, bill_title, mgl_ref, commottee_info, mgl_names
        query (str): Query string containing details on what model has to do.
        llm (ChatOpenAI): LLM call object

    Returns:
        (str): Raw response of the LLM.

    """

    emb_api = OpenAIEmbeddings()
    chroma_client = get_or_create_embeddings(bill_details, emb_api)

    vectorstore = Chroma(
        client=chroma_client,
        collection_name="bills_collection",
        embedding_function=emb_api,
    )

    retrieval_doc_count = min(
        (MAX_TOKEN_LIMIT - count_tokens("", bill_details.bill_text, "", "", "")) // 2000
        - 2,
        7,
    )

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": retrieval_doc_count,
            "filter": {"bill_id": bill_details.bill_id},
        },
    )

    # retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 12})

    template = """You are a trustworthy assistant for this task. Use the following pieces of retrieved context to accomplish the job.
        
        Relevant Massachussets General Law section text for context: {context}

        Bill Details: {question}

        """

    prompt = PromptTemplate.from_template(template)
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    try:
        with get_openai_callback() as _cb:
            response = rag_chain.invoke(query)
    except Exception as e:
        print(e)

    return response
