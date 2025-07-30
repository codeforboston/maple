from firebase_functions.firestore_fn import (
    on_document_created,
    Event,
    DocumentSnapshot,
)
from llm_functions import get_summary_api_function, get_tags_api_function_v2
from typing import TypedDict
from collections import deque


# This allows us to type the return of `get_topics`
class TopicAndCategory(TypedDict):
    # We use the name `tag` in Python, but `topic` in the database
    topic: str
    # Topic can be mapped directly to a category
    category: str


def get_categories_from_topics(
    topics: list[str], topic_to_category: dict[str, str]
) -> list[TopicAndCategory]:
    to_return = deque()
    for topic in topics:
        if topic_to_category.get(topic):
            to_return.append(
                TopicAndCategory(topic=topic, category=topic_to_category[topic])
            )
    return to_return


@on_document_created(document="generalCourts/{session_id}/bills/{bill_id}")
def add_summary_on_document_created(event: Event[DocumentSnapshot]) -> None:
    bill_id = event.params["bill_id"]
    inserted_data = event.data
    inserted_content = inserted_data.to_dict()

    # If the summary was pre-propulated for some reason, we don't want to run the LLM
    if inserted_content.get("summary"):
        print(f"bill with id `{bill_id}` has summary")
        return

    document_text_exists = inserted_content.get("contents").get("DocumentText")
    document_title_exists = inserted_content.get("contents").get("Title")
    if document_text_exists and document_title_exists:
        document_text = inserted_content["contents"]["DocumentText"]
        document_title = inserted_content["contents"]["Title"]

        summary = get_summary_api_function(bill_id, document_title, document_text)

        if summary["status"] in [-1, -2]:
            print(
                f"failed to generate summary for bill with id `{bill_id}`, got {summary['status']}"
            )
            return

        inserted_data.reference.update({"summary": summary["summary"]})
        print(f"Successfully updated summary for bill with id `{bill_id}`")

        # If the topics are pre-propulated for some reason, we don't want to run the LLM
        if inserted_content.get("topics"):
            print(f"bill with id `{bill_id}` has topics")
            return

        tags = get_tags_api_function_v2(bill_id, document_title, summary)

        if tags["status"] != 1:
            print(
                f"failed to generate tags for bill with id `{bill_id}`, got {tags['status']}"
            )
            return
        topics_and_categories = get_categories_from_topics(
            tags["tags"], category_by_topic()
        )
        inserted_data.reference.update({"topics": topics_and_categories})
        print(f"Successfully updated topics for bill with id `{bill_id}`")
    else:
        print(f"unable to find document text or title for bill with id `{bill_id}`")
    return


def category_by_topic():
    to_return = {}
    for category, topics in TOPICS_BY_CATEGORY.items():
        for topic in topics:
            to_return[topic] = category
    return to_return


TOPICS_BY_CATEGORY = {
    "Commerce": [
        "Banking and financial institutions regulation",
        "Consumer protection",
        "Corporation law and goverance",
        "Commercial insurance",
        "Marketing and advertising",
        "Non-profit law and governance",
        "Occupational licensing",
        "Partnerships and limited liability companies",
        "Retail and wholesale trades",
        "Securities",
    ],
    "Crime and Law Enforcement": [
        "Assault and harassment offenses",
        "Correctional facilities",
        "Crimes against animals and natural resources",
        "Crimes against children",
        "Criminal investigation, prosecution, interrogation",
        "Criminal justice information and records",
        "Criminal justice reform",
        "Criminal sentencing",
        "Firearms and explosives",
        "Fraud offenses and financial crimes",
        "Property crimes",
    ],
    "Economics and Public Finance": [
        "Budget process",
        "Debt collection",
        "Eminent domain",
        "Financial literacy",
        "Financial services and investments",
        "Government contractors",
        "Pension and retirement benefits",
    ],
    "Education": [
        "Academic performance and assessments",
        "Adult education and literacy",
        "Charter and private schools",
        "Curriculum and standards",
        "Education technology",
        "Educational facilities and institutions",
        "Elementary and secondary education",
        "Higher education",
        "Special education",
        "Student aid and college costs",
        "Teachers and educators",
        "Vocational and technical education",
    ],
    "Emergency Management": [
        "Disaster relief and insurance",
        "Emergency communications systems",
        "Emergency medical services and trauma care",
        "Emergency planning and evacuation",
        "Hazards and emergency operations",
    ],
    "Energy": [
        "Energy costs assistance",
        "Energy efficiency and conservation",
        "Energy infrastructure and storage",
        "Energy prices and subsidies",
        "Energy research",
        "Renewable energy sources",
    ],
    "Environmental Protection": [
        "Air quality",
        "Environmental assessment, monitoring, research",
        "Environmental education",
        "Environmental health",
        "Environmental regulatory procedures",
        "Hazardous wastes and toxic substances",
        "Pollution control and abatement",
        "Soil pollution",
        "Trash and recycling",
        "Water quality",
        "Wetlands",
        "Wildlife conservation",
    ],
    "Families": [
        "Adoption and foster care",
        "Family planning and birth control",
        "Family relationships and status",
        "Family services",
        "Life insurance",
        "Parenting and parental rights",
    ],
    "Food, Drugs, and Alcohol": [
        "Alcoholic beverages and licenses",
        "Drug, alcohol, tobacco use",
        "Drug safety, medical device, and laboratory regulation",
        "Food industry and services",
        "Food service employment",
        "Food supply, safety, and labeling",
        "Nutrition and diet",
    ],
    "Government Operations and Elections": [
        "Census and government statistics",
        "Government information and archives",
        "Government studies and investigations",
        "Government trust funds",
        "Lobbying and campaign finance",
        'Municipality oversight and "home rule petitions"',
        "Political advertising",
        "Public-private partnerships",
        "Voting and elections",
    ],
    "Healthcare": [
        "Alternative treatments",
        "Dental care",
        "Health care costs",
        "Health facilities and institutions",
        "Health information and medical records",
        "Health insurance and coverage",
        "Health technology, devices, supplies",
        "Healthcare workforce",
        "Medical research",
        "Mental health",
        "Prescription drugs",
        "Sex and reproductive health",
        "Substance use disorder and addiction",
        "Telehealth",
        "Veterinary services and pets",
    ],
    "Housing and Community Development": [
        "Community life and organization",
        "Cooperative and condominium housing",
        "Homelessness and emergency shelter",
        "Housing discrimination",
        "Housing finance and home ownership",
        "Housing for the elderly and disabled",
        "Housing industry and standards",
        "Housing supply and affordability",
        "Landlord and tenant",
        "Low- and moderate-income housing",
        "Residential rehabilitation and home repair",
    ],
    "Immigrants and Foreign Nationals": [
        "Immigrant health and welfare",
        "Refugees, asylum, displaced persons",
        "Right to shelter",
        "Translation and language services",
    ],
    "Labor and Employment": [
        "Employee benefits",
        "Employment discrimination",
        "Employee leave",
        "Employee pensions",
        "Employee performance",
        "Migrant, seasonal, agricultural labor",
        "Self-employment",
        "Temporary and part-time employment",
        "Workers' compensation",
        "Workforce development and employment training",
        "Worker safety and health",
        "Youth employment and child labor",
    ],
    "Law and Judiciary": [
        "Civil disturbances",
        "Evidence and witnesses",
        "Judicial and court records",
        "Judicial review and appeals",
        "Jurisdiction and venue",
        "Legal fees and court costs",
    ],
    "Public and Natural Resources": [
        "Agriculture and aquaculture",
        "Coastal zones and ocean",
        "Forests, forestry, trees",
        "Monuments and memorials",
        "Watershed and water resources",
        "Wildlife",
    ],
    "Social Services": [
        "Child care and development",
        "Domestic violence and child abuse",
        "Food assistance and relief",
        "Home and outpatient care",
        "Social work, volunteer service, charitable organizations",
        "Unemployment",
        "Urban and suburban affairs and development",
        "Veterans' education, employment, rehabilitation",
        "Veterans' loans, housing, homeless programs",
        "Veterans' medical care",
    ],
    "Sports and Recreation": [
        "Art and culture",
        "Gambling and lottery",
        "Hunting and fishing",
        "Outdoor recreation",
        "Professional sports, stadiums and arenas",
        "Public parks",
        "Sports and recreation facilities",
    ],
    "Taxation": [
        "Capital gains tax",
        "Corporate tax",
        "Estate tax",
        "Excise tax",
        "Gift tax",
        "Income tax",
        "Payroll and emplyoment tax",
        "Property tax",
        "Sales tax",
        "Tax-exempt organizations",
        "Transfer and inheritance taxes",
    ],
    "Technology and Communications": [
        "Advanced technology and technological innovations",
        "Atmospheric science and weather",
        "Broadband and internet access",
        "Computers and information technology",
        "Cybersecurity and identity theft",
        "Data privacy",
        "Emerging technology (artificial intelligence, blockchain, etc.)",
        "Genetics",
        "Internet, web applications, social media",
        "Photography and imaging",
        "Telecommunication rates and fees",
        "Telephone and wireless communication",
    ],
    "Transportation and Public Works": [
        "Aviation and airports",
        "Highways and roads",
        "MBTA & public transportation",
        "Public utilities and utility rates",
        "Railroads",
        "Vehicle insurance and repairs",
        "Water storage",
        "Water use and supply",
    ],
}
