import json
import numpy as np
from dotenv import load_dotenv
import os
import pandas as pd
import tiktoken
import streamlit as st
import urllib.request
import chromadb
import re
import requests

from chromadb.config import Settings
from dataclasses import dataclass, field
from langchain_text_splitters import TokenTextSplitter

from operator import itemgetter
from pathlib import Path
from requests.exceptions import RequestException
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Tuple, List

from prompts import *
from tag_categories import *
load_dotenv()



@dataclass()
class TestimonyDetails():
    '''
    A class to store all the details pertaining to a testimony. 
    '''
    testimony_id: str = ''
    testimony_text: str = ''
    invoke_dict: dict = field(default_factory=list)
    summary: str = ''


# unpack section and chapter for example: ['2', '15D']
link = f'https://malegislature.gov/api/Hearings/4548'
r = requests.get(link, verify=False)
r = r.json()

data = open('hearing-4548.json',)

testimony = json.load(data)

text = testimony['text']
bill_numbers = [
    doc["BillNumber"]
    for agenda in r.get("HearingAgendas", [])
    for doc in agenda.get("DocumentsInAgenda", [])
]
print(bill_numbers)
summaries = {
"H272": "The bill proposes that the department of transitional assistance provide financial support to pregnant individuals who do not have dependent children, starting from the time their pregnancy is confirmed. This assistance would be equivalent to the amount designated for a single person under an existing aid program. The aim is to help those in need during their pregnancy, ensuring they have some financial resources available. This would happen if the bill is passed.",
"H278": "The bill proposes to provide financial support to individuals experiencing homelessness who are eligible for assistance, ensuring they receive the same payment rate as those with shelter costs. It also includes provisions for annual budget increases for eligible recipients based on inflation, as measured by the Consumer Price Index. Additionally, the bill aims to align the maximum benefits for this program with another existing assistance program. The department will establish necessary rules and regulations to implement these changes.",
"H287": "A special commission would be established to study how to improve safety for blind and visually impaired individuals in public walkways and intersections. This commission would work with the Massachusetts Commission for the Blind to review current safety policies, accessible pedestrian signals, and new technologies. It would consist of nine members, including state officials and advocates for the blind community. If the bill is passed, the commission would report its findings and recommendations within one year.",
"H292": "A special commission would be established to review regulations and practices of the Department of Developmental Services that may hinder effective service delivery for individuals with autism and intellectual developmental disabilities. The commission would focus on identifying and removing barriers, improving licensing processes, and enhancing service delivery for high-need populations. It would consist of various appointed members, including legislators and representatives from relevant organizations, and is expected to report its findings and recommendations by the end of 2026. Appointments to the commission would need to be made by the end of 2025, with the first meeting occurring in April 2025.",
"H295": "The bill proposes that the Department of Transitional Assistance provide an additional monthly payment of $30 for diapers to parents or guardians of dependent children. This payment would be available alongside existing assistance programs aimed at supporting families in need. The intent is to help alleviate some of the financial burden associated with raising young children. If passed, this measure would enhance the support provided to families with dependent children.",
"H299": "The bill proposes changes to the management of business improvement districts (BIDs) to enhance their operation and accountability. It establishes that property owners who do not initially participate in a BID will automatically become members during renewal votes, which occur every five years to assess the BID's performance and decide on its continuation. Additionally, it mandates that financial reports from BIDs be made publicly accessible, ensuring transparency in their operations and funding. The bill aims to streamline the renewal process and improve oversight of BID activities.",
"H302": "A city or town can deny housing applications that do not align with an approved comprehensive housing production plan for up to two years after the plan is approved. This aims to ensure that new developments support the community's housing goals. The bill emphasizes the importance of planning in managing housing growth effectively. Overall, it provides local governments with more control over housing development in their areas.",
"H304": "A new office will be created within the Office of Business Development to focus on supporting and enhancing downtown and commercial areas in cities and towns. This office will act as the main agency for promoting these districts, providing resources such as information, marketing, and technical assistance. It will also coordinate efforts among various local, state, and federal groups involved in Main Street initiatives. The goal is to strengthen and protect the economic vitality of these community centers.",
"H305": "The bill proposes to allow multifamily housing developments by right in designated zoning districts that cover at least 1.5% of a city's or town's developable land, with a minimum density of 20 dwelling units per acre. It also aims to streamline the approval process for open space residential developments, removing the requirement for a standard subdivision plan before approval. Additionally, it introduces a site plan review process for developments that do not require special permits, ensuring that local planning boards can assess site arrangements and improvements. The bill seeks to facilitate housing development while maintaining local planning authority.",
"H312": "The bill aims to enhance transparency and support for microbusinesses and small businesses by requiring the collection and reporting of data on financial assistance programs. It mandates that the agency prioritize socially or economically disadvantaged businesses, such as minority-owned and women-owned enterprises, in its initiatives. Additionally, the agency would publish its equity goals and relevant data on its website and in annual reports to legislative committees. This would help ensure that stakeholders have access to important information about the impact of these programs.",
"H322": "The bill proposes to expand the definition of 'consumer' to include businesses, allowing them to register for the 'Do Not Call' list, which aims to reduce unwanted telemarketing calls. It modifies existing laws to remove the distinction between residential and business telephone services in this context. If passed, this change would enable businesses to opt out of telemarketing calls, similar to how individual residents can currently do so. The bill seeks to enhance consumer protection by giving more entities the ability to limit unsolicited sales calls.",
"H339": "The bill proposes that all funeral establishments must participate in a specific state program related to the care and disposition of deceased individuals in order to maintain their licenses. This requirement aims to ensure that funeral directors adhere to certain standards and practices. If passed, the new rule would take effect by the end of 2027. This change is intended to enhance the oversight and regulation of funeral services within the state.",
"H340": "The bill aims to clarify the rules surrounding self-storage facilities for consumers. It defines 'abandoned leased space' more clearly, allowing operators to consider spaces empty if they contain items valued under $300 or if the occupant has surrendered their rights. Additionally, it permits rental agreements to be accepted electronically and states that occupants are bound by the agreement even if they do not sign it, as long as they use the space after receiving notice of the agreement.",
"H353": "The bill proposes to gradually increase the number of retail alcohol licenses that can be issued in a city or town. Specifically, it raises the current cap from 9 to 15 licenses over several years, with different increments taking effect in 2027, 2029, and 2031. This change aims to allow more businesses to sell alcoholic beverages, potentially increasing competition and consumer choice. The bill outlines specific conditions and fees associated with obtaining these licenses.",
"H365": "The bill proposes a process for individuals to appeal the approval of a Class 1 dealer license if they believe the licensing board has granted it to someone who does not meet the necessary requirements. It allows existing Class 1 licensees to challenge such decisions both administratively and in court. The registrar would be required to make a decision on the appeal within thirty days, and further appeals could be made to a superior court if necessary. This aims to ensure that licensing decisions are fair and compliant with established regulations.",
"H369": "The bill aims to protect children under 18 from harmful cosmetic products by prohibiting advertisements that target them or use their images if the products contain toxic ingredients. It defines harmful ingredients and establishes penalties for violations, including fines starting at $5,000. The attorney general would have the authority to enforce these regulations and individuals harmed by violations could seek legal action for damages. If passed, the law would take effect 90 days later.",
"H3782": "The bill proposes to eliminate the additional annual fee for VETERAN' motor vehicle registration plates, meaning that veterans would only pay the standard registration fee for their vehicles. It also ensures that there will be no increase in fees for the issuance or renewal of these distinctive plates. If passed, these changes would take effect 270 days after the bill's passage.",
"H380": "The bill aims to create a compact that allows social workers to practice across state lines more easily, enhancing access to services while maintaining state regulatory authority. It seeks to reduce the need for multiple licenses, promote cooperation among states, and support military families. Additionally, it includes provisions for telehealth services and the sharing of licensure and disciplinary information among member states. The bill emphasizes accountability for social workers to adhere to the laws and standards of the state where they provide services.",
"H3817": "The bill proposes to increase penalties for right-of-way violations that result in injuries or fatalities. If a violation leads to an injury, the offender could face a $200 fine and a 30-day license suspension; for serious injuries, the fine would be $500 with a 90-day suspension; and for fatalities, the fine would be $1,000 with a 180-day suspension. The bill aims to enhance road safety by imposing stricter consequences for drivers who fail to yield the right-of-way.",
"H384": "The bill aims to protect children from harmful chemicals in products designed for their use by prohibiting the sale of children's products containing intentionally added perfluoroalkyl and polyfluoroalkyl substances (PFAS). It requires the Department of Environmental Protection to maintain and publish a list of toxic chemicals of concern, which will be updated regularly, and mandates manufacturers to notify the department if their products contain these chemicals. Additionally, manufacturers must remove or substitute high-priority chemicals in certain children's products within a specified timeframe. The bill also establishes penalties for non-compliance and outlines procedures for public reporting and transparency regarding chemical use in children's products.",
"H385": "The bill aims to clarify existing consumer protection laws by explicitly including arbitration awards' alongside 'judgments' in the provisions that allow individuals to seek legal recourse for unfair business practices. This change would enable consumers to pursue claims based on arbitration outcomes, enhancing their ability to seek damages or equitable relief. Additionally, it reinforces the rights of individuals to bring class action lawsuits on behalf of others who have been similarly affected. Overall, the bill seeks to strengthen consumer protections in cases of unfair trade practices.",
"H390": "The bill proposes that if a store with a license to sell alcohol is found to have violated laws regarding sales to minors or intoxicated individuals, all of its commercial activities, including the sale of non-alcoholic items, would be suspended. This means that the store would not be able to operate at all during the suspension period. The bill aims to treat supermarkets, convenience stores, and package stores equally in such situations, removing any distinctions between them regarding license suspensions. Local licensing authorities would be responsible for adjudicating these violations and enforcing the suspensions.",
"S153": "The bill proposes to expand eligibility for the personal care attendant program to include individuals who need supervision and cueing to perform two or more daily activities. This change aims to ensure that more people who require assistance can access the necessary support. The division responsible for administering the program would be tasked with developing or updating the relevant standards and regulations to implement this change. If passed, this could help improve the quality of life for those who need additional help in their daily routines.",
"S154": "The bill aims to clarify the role of guardians as medical care providers for individuals who are incapacitated, allowing them to consent to medical services on behalf of those individuals. It establishes guidelines for determining payment rates for guardians and social service programs, ensuring these rates reflect the actual costs of providing care. Additionally, it outlines the requirements for guardians to submit claims for reimbursement and mandates that these claims be reported to the court overseeing their guardianship. The bill also includes provisions to prevent unauthorized claims for services covered by other insurance.",
"S157": "A new commission would be established to focus on the status of children and youth, consisting of 20 members appointed by various state leaders and organizations, including youth representatives. The commission would conduct ongoing studies and provide recommendations on issues affecting children and youth, such as education, health, and welfare. It would also serve as a liaison between government and private groups, promote youth engagement in civic activities, and report its findings annually. Members would serve without compensation but could be reimbursed for expenses incurred while performing their duties.",
"S161": "The bill proposes a monthly cash stipend of $1,000 for up to five years for young adults who have recently transitioned out of foster care, specifically those aged 18 to 23. It aims to support these individuals financially as they adjust to independent living, with provisions for case management assistance in applying for the stipend and other benefits. The stipend would not count as income for other state benefits, and payments would be paused if the individual returns to foster care. The department is required to inform eligible youth about this stipend and provide necessary support to help them manage their finances.",
"S177": "The bill aims to clarify definitions related to new residential and commercial developments in designated smart growth and starter home zoning districts. It specifies that substantial redevelopment of existing buildings is included if it meets certain financial thresholds or changes in use. The bill also outlines the criteria for these zoning districts to be eligible for financial incentives, promoting increased housing production and smart growth principles. Overall, it seeks to facilitate the development of affordable housing options within communities.",
"S181": "A new Office of Massachusetts Main Streets would be created within the Office of Business Development to focus on supporting downtown and commercial areas in cities and towns. This office would act as the main agency for promoting and protecting these districts, providing resources such as information, marketing, and technical assistance. It would also coordinate efforts among federal, state, and local groups involved in Main Street initiatives. The goal is to enhance the vitality of local commercial areas across the commonwealth.",
"S196": "The bill aims to clarify the definitions and regulations surrounding real estate appraisals and evaluations. It introduces a new term, 'evaluation,' which refers to property value estimates for transactions not requiring formal appraisals. Additionally, it restricts individuals without proper licensing from preparing appraisals for compensation, while allowing licensed appraisers to conduct evaluations without adhering to certain professional standards. This change is intended to ensure consumer protection and maintain the integrity of real estate transactions.",
"S221": "The bill proposes that the minimum legal age for purchasing alcohol, cannabis products, and tobacco products, as well as participating in online sports gaming, be set at 21 years old across the state. It aims to ensure a consistent age requirement for these activities, overriding any local laws that may set different age limits. The bill emphasizes that this uniformity is important for both consumers and retailers. Additionally, relevant state commissions would be responsible for updating regulations to implement this change if the bill is passed."
}
PROMPT = f'''
Provide a summary of this hearing to a regular person with no special knowledge or expertise of this area. 
This is a hearing discussing several pending bills. 
Provide a short summary of the sentiments that were expressed about the bills that were discussed during the hearing.
You do not need to provide a summary of the bills themselves.
Here is the hearing transcription: {text}
'''

PROMPT_BILL_SUMMARIES = f'''
Provide a summary of this hearing to a regular person with no special knowledge or expertise of this area. 
This is a hearing discussing several pending bills. 
Provide a short summary of the sentiments that were expressed about the bills that were discussed during the hearing.
You do not need to provide a summary of the bills themselves.
The text of the hearing is as follows:
```{text}
```
The summaries of each bill mentioned during the hearing are as follows:
```
{summaries}
```
'''
# Set up the OpenAI API client
import openai
api_key = os.getenv('OPENAI_API_KEY')
url = "https://api.openai.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer " + api_key,
    "Content-Type": "application/json"
}
data = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "user", "content": PROMPT_BILL_SUMMARIES}
    ],
}

response = requests.post(url, headers=headers, json=data)
message = response.json()
print(message['choices'][0]['message']['content']) 