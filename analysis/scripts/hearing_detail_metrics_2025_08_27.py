from __future__ import annotations

from collections import defaultdict
import os
from urllib.parse import urljoin, urlparse, parse_qs
import requests
from bs4 import BeautifulSoup, Tag

from rich import print
import json
import traceback
import re
from tqdm import tqdm
from pydantic import BaseModel, Field
from typing import Any, Callable, Pattern, Union
import click

MA_LEGISLATURE_URL = "https://malegislature.gov"


class HearingDocument(BaseModel):
    url: str = Field(repr=False)
    attachmentId: int
    Title: str
    fileExtension: str

    @classmethod
    def from_url(cls, url: str) -> "HearingDocument":
        parsed = urlparse(url)
        q = parse_qs(parsed.query)
        return cls(
            url=url,
            attachmentId=int(q["attachmentId"][0]),
            Title=q["Title"][0],
            fileExtension=q["fileExtension"][0],
        )

    def matches(self, pattern: Union[str, Pattern[str]]) -> bool:
        return bool(re.search(pattern, self.Title))


class HearingMetadata(BaseModel):
    EventId: int
    Details: str
    document_urls: list[str] | None = None
    testimony_instructions: str | None = None
    committee_votes: Any | None = None

    def scrape_details_page(self) -> None:
        if self.document_urls is not None and self.testimony_instructions is not None:
            return
        resp = requests.get(
            url=f"{MA_LEGISLATURE_URL}/Events/Hearings/Detail/{self.EventId}",
            headers={"User-Agent": "hearing-scraper/1.0"},
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        self.get_document_urls(soup)
        self.get_testimony_instructions(soup)
        self.get_committee_votes(soup)

    def get_document_urls(self, soup: BeautifulSoup) -> None:
        """Scrape hearing document urls from the hearing details page.

        Assumptions:
        - Testimony links appear in the first column of the table inside <div id="documentsSection">
        """
        docs_div = soup.find(id="documentsSection")
        if docs_div:
            assert isinstance(docs_div, Tag)
            self.document_urls = [
                urljoin(MA_LEGISLATURE_URL, str(a.get("href") or ""))
                for a in docs_div.select(  # type: ignore
                    "table.agendaTable tbody tr td:first-child a[href]"
                )
            ]

    # TODO
    def get_testimony_instructions(self, soup: BeautifulSoup) -> None:
        breakpoint()

    # TODO
    def get_committee_votes(self, soup: BeautifulSoup) -> None:
        breakpoint()


def keyword_regex(s: str) -> Pattern[str]:
    # Case-insensitive, allow underscore/dash or word boundary before/after
    return re.compile(rf"(?i)(?:\b|_|-){re.escape(s)}(?:\b|_|-)", re.IGNORECASE)


def ShouldMatch(
    *patterns: Union[re.Pattern[str], str],
) -> Callable[[HearingDocument], bool]:
    return lambda doc: all(doc.matches(p) for p in patterns)


def ShouldMatchOneOf(
    *patterns: Union[re.Pattern[str], str],
) -> Callable[[HearingDocument], bool]:
    """Given a list of regex patterns, return a "matching function" that checks
    if any one of the regex patterns was found in the url."""
    return lambda doc: any(doc.matches(p) for p in patterns)


BILL_ID_PAT = r"[HS]\.?\d+"
DASH_SEP_PAT = r"\s+[-–]\s+"
OPTIONAL_DASH_SEP_PAT = r"\s*[-–]?\s*"
TAG_PATTERNS: dict[str, Callable[[HearingDocument], bool]] = {
    "HearingPacket": ShouldMatch(r"Hearing Packet"),
    "Testimony": ShouldMatchOneOf(
        r"Written Testimony",
        keyword_regex(r"Oppose"),
        keyword_regex(r"Neutral"),
        keyword_regex(r"Support"),
    ),
    "BillSummary": ShouldMatchOneOf(
        keyword_regex(r"Summary"),
        # there's one instance of this misspelled title 👇
        keyword_regex(r"Bill Sumary"),
        # there's one instance of this misspelled title 👇
        r"Smmary",
    ),
    "BillSummaries": ShouldMatchOneOf(
        re.compile(r"Summaries", re.IGNORECASE),
    ),
    "BillId_AnAct": ShouldMatchOneOf(
        rf"^{BILL_ID_PAT}{OPTIONAL_DASH_SEP_PAT}An Act\b",
    ),
    "BillId_Resolve": ShouldMatchOneOf(
        rf"^{BILL_ID_PAT}{OPTIONAL_DASH_SEP_PAT}Resolve\b",
    ),
    "JustBillId": ShouldMatchOneOf(
        re.compile(rf"^\s*{BILL_ID_PAT}\s*$", re.IGNORECASE),
        # there's one instance of a misspelled title 👇
        r"S\.\.1711",
    ),
    "BillId_PlusSomethingElse": ShouldMatchOneOf(
        re.compile(rf"^{BILL_ID_PAT}{DASH_SEP_PAT}.+", re.IGNORECASE),
    ),
    "CommitteeVotes": ShouldMatchOneOf(
        rf"^{BILL_ID_PAT}{DASH_SEP_PAT}Votes of House Committee Members",
        rf"Votes of House Committee Members, {BILL_ID_PAT}",
        rf"^{BILL_ID_PAT}{DASH_SEP_PAT}House Committee Members Votes",
    ),
    "MeetingMinutes": ShouldMatchOneOf(
        r"Meeting Minutes$",
        r"Com Minutes$",
    ),
}


def get_hearings(cache_only: bool = False) -> list[HearingMetadata]:
    if os.path.exists("tmp-hearings.json"):
        with open("tmp-hearings.json", "r") as fp:
            existing_hearings = [HearingMetadata(**i) for i in json.load(fp)]
    else:
        existing_hearings = []
    if not cache_only:
        return existing_hearings
    resp = requests.get(
        url=f"{MA_LEGISLATURE_URL}/api/Hearings",
        headers={"Accept": "application/json"},
    )
    resp.raise_for_status()
    new_hearings = [
        hearing
        for hearing in [HearingMetadata(**i) for i in resp.json()]
        if hearing.EventId not in set(md.EventId for md in existing_hearings)
    ]
    return new_hearings + existing_hearings


@click.group()
def cli() -> None:
    """Utilities for scraping and analyzing hearing details."""
    pass


@cli.command("scrape-hearings")
def scrape_hearings():
    """
    Scrapes hearing detail pages, extracting document URLs and other metadata for each hearing,
    and saves the results to 'tmp-hearings.json'.
    """
    hearings = get_hearings(cache_only=False)
    try:
        for hearing in tqdm(hearings):
            hearing.scrape_details_page()
    except Exception as e:
        print("Exception occurred:", repr(e))
        traceback.print_exc()
    finally:
        with open("tmp-hearings.json", "w") as fp:
            json.dump(
                obj=[hearing.model_dump(exclude_none=True) for hearing in hearings],
                fp=fp,
                indent=2,
            )


@click.option(
    "--print-unmatched",
    is_flag=True,
    help="Print unmatched hearing documents in the report.",
)
@cli.command("analyze")
def analyze_hearings(print_unmatched: bool):
    """
    Analyzes the cached hearing documents in 'tmp-hearings.json', printing a report of
    document tag matches, unmatched documents, and file extension counts.
    """

    hearings = get_hearings(cache_only=True)
    if not hearings:
        print("Run `scrape` command first to get some hearings.")
    ext_counts: dict[str, int] = {}
    matches = defaultdict[str, list[str]](list)
    unmatched: list[str] = []
    url_tags: dict[str, set[str]] = {}
    for md in hearings:
        urls = md.document_urls or []
        for url in urls:
            parsed_url = HearingDocument.from_url(url)
            matched = False
            for label, matcher in TAG_PATTERNS.items():
                if matcher(parsed_url):
                    matches[label].append(url)
                    url_tags.setdefault(url, set()).add(label)
                    matched = True
            if not matched:
                unmatched.append(url)
            ext = parsed_url.fileExtension
            ext_counts[ext] = ext_counts.get(ext, 0) + 1

    def pct(part: int, whole: int) -> str:
        if whole == 0:
            return "0.0%"
        return f"{(part / whole) * 100:.1f}%"

    hearings_with_docs = len([hearing for hearing in hearings if hearing.document_urls])
    total_urls = sum(len(hearing.document_urls or []) for hearing in hearings)
    total_matches = total_urls - len(unmatched)
    print("[bold]Hearing Testimony URL Report[/bold]")
    print(
        {
            "hearings": {
                "total": len(hearings),
                "with_documents": hearings_with_docs,
                "with_documents_pct": pct(hearings_with_docs, len(hearings)),
            },
            "hearing_documents": {
                "total": total_urls,
                "file_extension_counts": ext_counts,
                "matches": {
                    "count": total_matches,
                    "keywords": {
                        k: {
                            "count": len(v),
                            "pct": pct(len(v), total_urls),
                        }
                        for k, v in matches.items()
                    },
                    "pct": pct(total_matches, total_urls),
                },
                "unmatched": {
                    "count": len(unmatched),
                    "pct": pct(len(unmatched), total_urls),
                    **(
                        {"items": [HearingDocument.from_url(url) for url in unmatched]}
                        if print_unmatched
                        else {}
                    ),
                },
            },
        }
    )


if __name__ == "__main__":
    cli()
