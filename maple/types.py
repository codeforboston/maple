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
    chamber_1 = "chamber_1"
    chamber_2 = "chamber_2"
    signed = "signed by governor"


class Branch(Enum):
    """The branch of government associated with a bill or action."""

    joint = "joint"
    house = "house"
    senate = "senate"
    executive = "executive"


class ActionType(Enum):
    uncategorized = "uncategorized"
    signed_by_governor = "signed_by_governor"
<<<<<<< HEAD
    engrossment = "engrossment"
=======
    engrossement = "engrossment"
>>>>>>> 6380369de7f5422f58ac7a2bb88f90ff222fb258
    hearing_scheduled = "hearing_scheduled"
    study_order = "study_order"
    referred = "referred"
    concurred = "concurred"
    reference = "reference"
    date_change = "date_change"
    reading = "reading"
    cancellation = "cancellation"
    rules_note = "rules_note"
<<<<<<< HEAD
    chamber_committee = "chamber_committee"
=======
    reported_that_the_matters = "reported_that_the_matters"
    read_second_order_third = "read_second_order_third"
    enacted = "enacted"
    ordered_to_a_third_reading = "ordered_to_a_third_reading"
    ordered_to_a_second_reading = "ordered_to_a_second_reading"
    second_reading = "second_reading"
    third_reading = "third_reading"
    rules_suspended = "rules_suspended"
    multiread_second_order_third = "multiread_second_order_third"
    Emergency_preamble_adopted = "Emergency_preamble_adopted"
    amendment = "amendment"
    adopted = "adopted"
    reported_favorably = "reported_favorably"
    amendments_considered = "amendments_considered"
    text_printed_as_amended = "text_printed_as_amended"
    text_of_amendment = "text_of_amendment"
    taken_out_of_od = "taken_out_of_od"
    substituted_as_amended = "substituted_as_amended"
    substituted_as_new_text = "substituted_as_new_text"
    substituted_for = "substituted_for"
    insist_on_amendment = "insist_on_amendment"
    non_concur = "non_concur"
    reported = "reported"
    reported_in_part = "reported_in_part"
    also_based = "also_based"
    accompanying = "accompanying"
    Amended = "Amended"
    Amendment = "Amendment"
    Reported = "Reported"
    Bills_in_3rd_report = "Bills_in_3rd_report"
    chapter = "chapter"
    committee_onof_conf = "committee_onof_conf"
    committee_recommended = "committee_recommended"
    discharged = "discharged"
    consolidated = "consolidated"
    for_message = "for_message"
    for_senate_actions = "for_senate_actions"
    postponed = "postponed"
    hearing_any = "hearing_any"
    non_concurred = "non_concurred"
    veto = "veto"
    receded = "receded"
    session_recessed = "session_recessed"
    laid_aside = "laid_aside"
    laid_before_gov = "laid_before_gov"
    motion = "motion"
    accepted = "accepted"
    rejected = "rejected"
    ordered_to = "ordered_to"
    ought = "ought"
    placed = "placed"
    point_of_order = "point_of_order"
    new_text = "new_text"
    order_considered = "order_considered"
    called_for_consideration = "called_for_consideration"
    roll_call = "roll_call"
    recommitted = "recommitted"
    negatived = "negatived"
    date_extended = "date_extended"
    returned = "returned"
    see = "see"
    substituted = "substituted"
    taken = "taken"
    Secretary_of_State = "Secretary_of_State"
    plan_approved = "plan_approved"
    recommended = "recommended"
    read = "read"
    new_draft = "new_draft"
    engrossed = "engrossed"
    accompanied = "accompanied"
    multi="multi"
>>>>>>> 6380369de7f5422f58ac7a2bb88f90ff222fb258


@dataclass(frozen=True)
class Committee:
    name: str


@dataclass(frozen=True)
class Action:
    """An action taken on a Bill."""

    action: str
    branch: Branch
    when: datetime
    committee: Committee | UnknownValue | None


@dataclass(frozen=True)
class Bill:
    """A Bill introduced by the legislature."""

    id: str
    history: list[Action]

    def status(self, on: datetime) -> Status:
<<<<<<< HEAD
        """The status of the bill, as of some date. """
=======
        """The status of the bill, as of some date."""
>>>>>>> 6380369de7f5422f58ac7a2bb88f90ff222fb258
        raise NotImplementedError()
