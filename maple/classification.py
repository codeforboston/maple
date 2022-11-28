import re
from typing import TypeVar

from maple.types import Action, ActionType

T = TypeVar("T")


def parse(rules: list[tuple[re.Pattern, T]], x: str) -> T | None:
    """Parse a string according to an ordered sequence of rules.

    The first matching rule will be constructed by calling the
    matching function with the regex match.
    """

    for rule, label in rules:
        if rule.match(x) is not None:
            return label

    return None


def regex_classification(action: Action) -> ActionType:
    if (t := parse(_action_rules, action.action)) is not None:
        return t
    else:
        return ActionType.uncategorized


_action_rules = [
    (re.compile(".*referred.*to the committee on(.*)", re.I), ActionType.referred), 
    # if going to a joint committee, this indicates first_committee
    # the second_committee will be: 
    #   - ways and means
    #   - steering and policy
    #   - steering policy and scheduling
    #   - rules
    #   - Health Care Financing
    #   - can be none
    # within the chamber stages there will/can be referals to: 
    #   - Health Care Financing
    #   - Bonding, Capital Expenditures and State Assets
    #   - bills in the third reading
    #   - ways and means
    #   - steering and policy
    #   - steering policy and scheduling
    #   - rules
    #   - can be none
    
    
    (re.compile(".*to be engrossed.*", re.I), ActionType.engrossement),
    # should be or move into stage chamber 2
    (re.compile(".*hearing scheduled.* ", re.I), ActionType.hearing_scheduled),
    (re.compile(".*accompanied a study order.*", re.I), ActionType.study_order),
    (re.compile("house concurred.*", re.I), ActionType.concurred),
    (re.compile("senate concurred.*", re.I), ActionType.concurred), 
    (re.compile("(see|accompanied) .*", re.I), ActionType.reference), 
    (re.compile("reporting date extended.*", re.I), ActionType.date_change),
    (re.compile("read ^\\w*", re.I), ActionType.reading),
    # 2nd and 3rd readings happen in the chambers. 1st read isn't always clearly listed.
    (re.compile("hearing canceled.*", re.I), ActionType.cancellation),
    (re.compile("rules suspended", re.I), ActionType.rules_note),
    (re.compile("signed by the governor.*", re.I), ActionType.signed_by_governor),
]

# To discuss tuesday
# -- how/when to label for stages, or translate action types into stages
# -- compound statuses solution
# -- who is adding/editing regexes?