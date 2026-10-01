"""Tests for entity name normalization (normalize.py)."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from normalize import normalize_entity_name as norm  # noqa: E402


@pytest.mark.parametrize("a,b", [
    # One firm under several spellings, or renamed with a descriptive suffix.
    ("Smith, Costello & Crawford", "Smith Costello & Crawford Public Policy Group, LLC"),
    ("Lynch & Fierro", "Lynch and Fierro, Counsellors at Law"),
    ("O'Neill and Associates", "O’Neill and Partners, LLC"),
    ("Delaney & Associates, INC", "Delaney and Associates, Inc"),
    ("Glynn Assiciates", "Glynn Associates"),
    ("JajugaAssociates", "Jajuga Associates"),
    ("Michael Muse, Attornet at Law", "Michael Muse Attorney at Law"),
    ("Morrison&Foerster", "Morrison & Foerster LLP"),
    ("C&J Bus Lines", "C & J Bus Lines, Inc."),
])
def test_variants_of_one_name_match(a, b):
    assert norm(a) == norm(b)


@pytest.mark.parametrize("a,b", [
    # Different firms that share a surname must stay apart.
    ("Delaney and Associates, Inc", "Delaney Legislative Services, Inc."),
    ("Delaney Policy Group", "Delaney Legislative Services, Inc."),
    ("Delaney Policy Group", "Delaney & Associates, INC"),
])
def test_firms_sharing_a_surname_stay_distinct(a, b):
    assert norm(a) != norm(b)


def test_bare_surname_firm_keeps_its_descriptor():
    assert norm("Delaney Legislative Services, Inc.") == "DELANEY LEGISLATIVE SERVICES"
    assert norm("Delaney & Associates") == "DELANEY ASSOCIATES"


def test_people_unchanged():
    assert norm("Carlo Basile") == "CARLO BASILE"
    assert norm("Hugh R. Jones, III") == "HUGH R JONES III"


def test_whole_words_only():
    """Descriptive phrases are removed as whole words, not as substrings."""
    assert norm("Cape Cod and Associations Group") == "CAPE COD AND ASSOCIATIONS GROUP"


def test_empty():
    assert norm(None) == ""
    assert norm("") == ""
