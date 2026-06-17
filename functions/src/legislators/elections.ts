import { JSDOM } from 'jsdom'
import { Array as ArrayType, Runtype, Union, Literal, String, Boolean, Number, Optional, Static, Record } from 'runtypes'

const officeIds = {
  "President": 1,
  "U.S. Senate": 6,
  "U.S. House": 5,
  "Governor": 3,
  "Lieutenant Governor": 4,
  "Attorney General": 12,
  "Secretary of the Commonwealth": 45,
  "Treasurer": 53,
  "Auditor": 90,
  "Governor's Council": 529,
  "State Senate": 9,
  "State Representative": 8,
  "Party State Committee Man": 521,
  "Party State Committee Woman": 522,
  "Delegate to the National Convention": 543,
  "Alternate Delegate to the National Convention": 544,
  "District Attorney": 530,
  "Clerk of Courts": 15,
  "Clerk of Superior Court (Civil)": 534,
  "Clerk of Superior Court (Criminal)": 535,
  "Clerk of Supreme Judicial Court": 536,
  "County Charter Commission": 532,
  "Register of Deeds": 384,
  "Sheriff": 386,
  "County Treasurer": 389,
  "Probate Judge": 434,
  "Register of Probate": 537,
  "Council of Governments Executive Committee": 531
} as const
export const offices = Object.keys(officeIds) as (keyof typeof officeIds)[];
export type Office = keyof typeof officeIds

export const parties = [
  "General",
  "American",
  "Democratic",
  "Green-Rainbow",
  "Independent Voters",
  "Libertarian",
  "Republican",
  "Working Families",
  "United Independent Party",
  "United Independent",
  "Independent",
  "Green",
  "Workers Party"
] as const;
export type Party = (typeof parties)[number];
export const Party = Union(
  Literal(parties[0]), ...parties.slice(1).map(Literal)
);

const stages = [
  "Primaries",
  ...parties
]

export const ElectionCandidate = Record({
  name: String,
  writeIn: Boolean,
  votes: Number,
  percent: Number,
  // Note: During a primary election, no candidate is assigned a party
  party: Optional(String),
});

export type ElectionCandidate = Static<typeof ElectionCandidate>;

export const ElectionResult = Record({
  candidates: ArrayType(ElectionCandidate),
  otherVotes: Number,
  blankVotes: Number,
  totalVotes: Number,
  electionDetailsUrl: String, // If we want votes by town
});

export type ElectionStage = Static<typeof ElectionStage>;

export const ElectionStage =  Record({
    party: Party,
    special: Boolean,
})

export type ElectionResult = Static<typeof ElectionResult>;

export const ElectionInfo = Record({
  year: Number,
  office: String,
  districts: String,
  stage: ElectionStage,
  result: Optional(ElectionResult),
});

export type ElectionInfo = Static<typeof ElectionInfo>;

const baseURL = 'https://electionstats.state.ma.us'

function parseElectionStage(input: string): ElectionStage | null {
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const partyPattern = parties
    .map(escape)
    .sort((a, b) => b.length - a.length)
    .join("|");

  const regex = new RegExp(
    `^(Special )?(${partyPattern}) (Primary|Election)$`
  );

  const match = input.match(regex);
  if (!match) {
    return null;
  }

  const [, special, party, stage] = match;

  // Only "General Election" is valid.
  if (stage === "Election" && party !== "General") {
    return null;
  }

  // Only non-General parties have primaries.
  if (stage === "Primary" && party === "General") {
    return null;
  }

  return {
    party: Party.check(party),
    special: special !== undefined,
  };
}

function parseElectionTable(table: Element): ElectionResult {
    const candidateRows = table.querySelectorAll(
        ':scope > tr:not(.non_candidate):not(.more_info)'
    );

    const candidates = Array.from(candidateRows).map(row => {
        const name = row.querySelector('.candidate .name a')?.textContent?.trim() || '';

        let affiliationText =
            row.querySelector('.candidate .party')?.textContent?.trim() || '';

        const writeIn = /\bwrite-in\b/i.test(affiliationText);

        let party;
        affiliationText = affiliationText.replace(/\(write-in\)/i, '').replace(/unenrolled/i, '').trim()
        if (affiliationText) {
            party = affiliationText
        }

        const voteText = row.querySelector('td:nth-child(2)')?.textContent?.replace(/,/g, '')
        const percentText = row.querySelector('td:nth-child(3)')?.textContent?.trim()?.slice(0, -1)
        if (!name || !voteText || !percentText) {
            throw new Error(row.outerHTML)
        }

        const candidate = {
            name,
            writeIn,
            votes: parseInt(voteText, 10),
            percent: parseFloat(percentText),
            ...(party ? { party } : {})
        };

        return candidate;
    });

    candidates.sort((a,b) => b.votes - a.votes)

    const getSummaryValue = (selector: string): number => {
        const row = table.querySelector(selector);

        const text = row?.querySelector('td:nth-child(2)')?.textContent?.replace(/,/g, '');
        if (!text) {
            return 0
        }

        return parseInt(text, 10);
    };

    const link = table.querySelector<HTMLAnchorElement>('tr.more_info a')?.href
    if (!link) {
        throw new Error("Link not present")
    }

    return {
        candidates,
        otherVotes: getSummaryValue('tr.n_all_other_votes'),
        blankVotes: getSummaryValue('tr.n_blank_votes'),
        totalVotes: getSummaryValue('tr.n_total_votes'),
        electionDetailsUrl: `${baseURL}${link}`
    };
}

function info(dom: JSDOM): ElectionInfo[] {
    const elements = Array.from(dom.window.document.querySelectorAll(
        '[id^="election-id-"]'
    ))
    const info = elements.map(electionElem => {
        const electTDs = Array.from(electionElem.children).filter(child => child.tagName === 'TD')
        const yearText = electTDs[0].textContent
        if (!yearText) {
            throw new Error("eh")
        }
        const year = parseInt(yearText, 10)
        const office = electTDs[1].textContent?.trim()
        const districts = electTDs[2].textContent?.trim()
        const stage = parseElectionStage(electTDs[3].textContent?.trim() ?? '')
        if (!stage) {
            throw new Error(`${stage} is not a recognized election stage`)
        }
        if (electTDs[4].querySelector(':scope > .no_candidates')) {
            return ElectionInfo.check({
                year,
                office,
                districts,
                stage
            })
        }
        const candidateTable = electTDs[4].querySelector(':scope tbody')
        if (!candidateTable) {
            throw new Error("Election results expects table or no candidates")
        }
        const result = parseElectionTable(candidateTable)

        return ElectionInfo.check({
            year,
            office,
            districts,
            stage,
            result
        })
    })
    return info
}

export async function fetchElectionData(
    startYear: number,
    endYear: number,
    office?: Office,
    stage: null | string = "General"
): Promise<ElectionInfo[]> {
    if (stage !== null && !stages.includes(stage)) {
        throw new Error("Unrecognized election stage")
    }
    const officeId = office ? `/office_id:${officeIds[office]}` : ''
    const electionStage = stage ? `/stage:${stage}` : ''
    const url = `${baseURL}/elections/search/year_from:${startYear}/year_to:${endYear}${officeId}${electionStage}`
    const dom = new JSDOM(await (await fetch(url)).text())
    return info(dom)
}

import { writeFileSync } from 'fs'

(async () => {
    writeFileSync('elections.json', JSON.stringify(await fetchElectionData(2022, 2023), undefined, 2))
})()