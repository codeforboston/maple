"""Tests for entity name normalization (normalize.py)."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from normalize import normalize_entity_name as norm  # noqa: E402


@pytest.mark.parametrize("a,b", [
    # One firm under several spellings, or renamed with a descriptive suffix.
    ("Barlow, Finch & Kerr", "Barlow Finch & Kerr Public Policy Group, LLC"),
    ("Ward & Pell", "Ward and Pell, Counsellors at Law"),
    ("O'Dowd and Associates", "O’Dowd and Partners, LLC"),
    ("Hartwell & Associates, INC", "Hartwell and Associates, Inc"),
    ("Corbin Assiciates", "Corbin Associates"),
    ("TrevaniAssociates", "Trevani Associates"),
    ("Dana Pruitt, Attornet at Law", "Dana Pruitt Attorney at Law"),
    ("Halden&Voss", "Halden & Voss LLP"),
    ("R&T Bus Lines", "R & T Bus Lines, Inc."),
])
def test_variants_of_one_name_match(a, b):
    assert norm(a) == norm(b)


@pytest.mark.parametrize("a,b", [
    # Different firms that share a surname must stay apart.
    ("Hartwell and Associates, Inc", "Hartwell Legislative Services, Inc."),
    ("Hartwell Policy Group", "Hartwell Legislative Services, Inc."),
    ("Hartwell Policy Group", "Hartwell & Associates, INC"),
])
def test_firms_sharing_a_surname_stay_distinct(a, b):
    assert norm(a) != norm(b)


def test_bare_surname_firm_keeps_its_descriptor():
    assert norm("Hartwell Legislative Services, Inc.") == "HARTWELL LEGISLATIVE SERVICES"
    assert norm("Hartwell & Associates") == "HARTWELL ASSOCIATES"


def test_people_unchanged():
    assert norm("Jordan Ellery") == "JORDAN ELLERY"
    assert norm("Avery T. Nolan, III") == "AVERY T NOLAN III"


def test_whole_words_only():
    """Descriptive phrases are removed as whole words, not as substrings."""
    assert norm("Cape Cod and Associations Group") == "CAPE COD AND ASSOCIATIONS GROUP"


def test_empty():
    assert norm(None) == ""
    assert norm("") == ""
