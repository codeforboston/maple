import json
import numpy as np
import os
import pandas as pd
# import tiktoken
# import streamlit as st
import urllib.request
# import chromadb
import re
import requests

# from chromadb.config import Settings
from dataclasses import dataclass, field
# from langchain_text_splitters import TokenTextSplitter

from operator import itemgetter
from pathlib import Path
from requests.exceptions import RequestException
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Tuple, List

from prompts import *
from tag_categories import *
import firebase_admin
from firebase_admin import firestore
import openai
# import google.auth
PROMPT_INSTRUCTIONS = "Follow these instructions when creating the summary: \n" \
"-Try to provide a balanced summary giving space to multiple sides of an issue that were shared in the hearing \n" \
"-Try to avoid repeating uncritically the facts that were shared in testimony, as they may not be accurate \n" \
"-Do not repeat any offensive, slanderous, or personally derogatory statements \n" \
"-Note that the transcripts may contain transcription errors, such as mis-identified homophones, and that names referenced in the hearing may not have been transcribed accurately."

# Set the environment variable for the Google Cloud project
os.environ["GOOGLE_CLOUD_PROJECT"] = "digital-testimony-dev"

@dataclass()
class HearingDetails():
    '''
    A class to store all the details pertaining to a testimony. 
    '''
    hearing_id: str = ''
    hearing_text: str = ''
    summary: str = ''


def receive_hearing(hearing: HearingDetails):
    hearing_text = hearing.hearing_text 
    hearing_id = hearing.hearing_id
    print(f'Receiving hearing with ID: {hearing_id}')
    link = f'https://malegislature.gov/api/Hearings/{hearing_id}'
    #Convert the hearing to a JSON object, allows us to access the bill ids
    #that are mentioned during the hearing
    r = requests.get(link, verify=False)
    r = r.json()
    bill_numbers = [
    doc["BillNumber"]
    for agenda in r.get("HearingAgendas", [])
    for doc in agenda.get("DocumentsInAgenda", [])
    ]
    print(bill_numbers)
    try:
        db = connect_to_firestore()
    except Exception as e:
        print(f'Error connecting to Firestore: {e}')
        # st.error("Could not connect to Firestore. Please check your configuration.")
        return hearing_text, {}

    bill_summaries = {}
    for number in bill_numbers:
        # Get the bill document from Firestore
        bill_ref = db.collection("generalCourts").document("194").collection("bills").document(number)
        # Fetch the document
        bill_doc = bill_ref.get()
        if bill_doc.exists:
            bill_data = bill_doc.to_dict()
            # Append the summary to the list
            bill_summaries.update({number: bill_data.get("summary", "")})
        # else:
            # st.warning(f"Bill {number} not found in Firestore.")
    return hearing_text, bill_summaries

def connect_to_firestore():
    firebase_admin.initialize_app()
    db = firestore.client()
    return db

def make_openai_request(prompt: str) -> str:
    """
    Make a request to OpenAI's API to get a response for the given prompt.
    """
    url = "https://api.openai.com/v1/chat/completions"

    openai.api_key = os.environ.get("OPENAI_API_KEY")
    headers = {
        "Authorization": f"Bearer " + openai.api_key,
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "user", "content": prompt}
        ],
    }
    response = requests.post(url, headers=headers, json=data)
    message = response.json()
    return message['choices'][0]['message']['content']

if __name__ == "__main__":
    # Example usage
    data = open('./jsons/hearing-4539.json',)

    testimony = json.load(data)

    hearing_text = testimony['text']
    hearing = HearingDetails(
        hearing_id=4539,
        hearing_text=hearing_text,
        summary="This is a sample summary."
    )
    text, summaries = receive_hearing(hearing)
    PROMPT_BILL_SUMMARIES = f'''
Provide a summary of this hearing to a regular person with no special knowledge or expertise of this area. 
This is a hearing discussing several pending bills. 
Provide a short summary of the sentiments that were expressed about the bills that were discussed during the hearing.
Focus on which bills were discussed the most, and what the most common points were.
Pull, if applicable, a compelling quote that is representative of a commonly made argument.
If there was consensus on any specific point agreed upon by stakeholders who otherwise disagreed, please note that.
You do not need to provide a summary of the bills themselves.
Try and keep the overview of the hearing to 300 words or less.
Follow these instructions when creating the prompt: {PROMPT_INSTRUCTIONS}
The text of the hearing is as follows:
```
{text}
```
The summaries of each bill mentioned during the hearing are as follows:
```
{summaries}
```
'''
    response = make_openai_request(PROMPT_BILL_SUMMARIES)
    print(response)