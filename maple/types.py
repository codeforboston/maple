from dataclasses import dataclass
from datetime import datetime
from enum import Enum


@dataclass(frozen=True)
class UnknownValue:
    """A catch-all error type when we fail to parse a value."""

    value: str


class Status(Enum):
    """The status of a bill."""

    introduced = "introduced"
    first_committee = "first committee"
    second_committee = "second committee"
    chamber_1 = "chamber 1"
    chamber_2 = "chamber_2"
    signed = "signed by governor"


class Stage(Enum):
    introduced = "introduced"
    first_committee = "first_committee"
    second_committee = "second_committee"
    first_chamber = "first_chamber"
    second_chamber = "second_chamber"
    signed_by_governor = "signed_by_governor"
    not_staged = "not_staged"


class Branch(Enum):
    """The branch of government associated with a bill or action."""

    joint = "joint"
    house = "house"
    senate = "senate"
    executive = "executive"


class ActionType(Enum):
    uncategorized = "uncategorized"
    signed_by_governor = "signed_by_governor"
    engrossement = "engrossment"
    hearing_scheduled = "hearing_scheduled"
    study_order = "study_order"
    referred = "referred"
    concurred = "concurred"
    reference = "reference"
    date_change = "date_change"
    reading = "reading"
    cancellation = "cancellation"
    rules_note = "rules_note"


class JointComnittees(Enum):
    advanced_information_technology_the_internet_and_cybersecurity = (
        "advanced_information_technology_the_internet_and_cybersecurity"
    )
    bonding_capital_expenditures_and_state_assets = (
        "bonding_capital_expenditures_and_state_assets"
    )
    cannabis_policy_ = "cannabis_policy"
    children_families_and_persons_with_disabilities = (
        "children_families_and_persons_with_disabilities"
    )
    community_development_and_small_businesses = (
        "community_development_and_small_businesses"
    )
    consumer_protection_and_professional_licensure = (
        "consumer_protection_and_professional_licensure"
    )
    covid_19_and_emergency_preparedness_and_management = (
        "covid-19_and_emergency_preparedness_and_management"
    )
    economic_development_and_emerging_technologies = (
        "economic_development_and_emerging_technologies"
    )
    education = "education"
    elder_affairs = "elder_affairs"
    election_laws = "election_laws"
    environment_natural_resources_and_agriculture = (
        "environment_natural_resources_and_agriculture"
    )
    export_development = "export_development"
    financial_services = "financial_services"
    health_care_financing = "health_care_financing"
    higher_education = "higher_education"
    housing = "housing"
    the_judiciary = "the_judiciary"
    labor_and_workforce_development = "labor_and_workforce_development"
    mental_health_substance_use_and_recovery = (
        "mental_health_substance_use_and_recovery"
    )
    municipalities_and_regional_government = "municipalities_and_regional_government"
    public_health = "public_health"
    public_safety_and_homeland_security = "public_safety_and_homeland_security"
    public_service = "public_service"
    racial_equity_civil_rights_and_inclusion = (
        "racial_equity_civil_rights_and_inclusion "
    )
    revenue = "revenue"
    state_administration_and_regulatory_oversight = (
        "state_administration_and_regulatory_oversight"
    )
    telecommunications_utilities_and_energy = "telecommunications_utilities_and_energy"
    tourism_arts_and_cultural_development = "tourism_arts_and_cultural_development"
    transportation = "transportation"



@dataclass(frozen=True)
class Action:
    """An action taken on a Bill."""

    action: str
    branch: Branch
    when: datetime


@dataclass(frozen=True)
class Bill:
    """A Bill introduced by the legislature."""

    id: str
    history: list[Action]

    def status(self, on: datetime) -> Status:
        """The status of the bill, as of some date."""
        raise NotImplementedError()
