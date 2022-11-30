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
        """The status of the bill, as of some date. """
        raise NotImplementedError()
