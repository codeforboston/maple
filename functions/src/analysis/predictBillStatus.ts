import { BillHistory } from "../bills/types"
import { Stage } from "./types"

const chamberCommittees = [
  "committee on rules",
  "committee on rules of the two branches, acting concurrently",
  "committee on senate ways and means",
  "committee on house ways and means",
  "committee on house steering, policy and scheduling",
  "committee on senate steering and policy",
  "committee on senate housing and finance",
  "committee on house housing and finance",
  "committee on housing and finance",
  "committee on house housing and finance",
  "committee on health care financing",
  "committee on bills in the third reading"
].map(s => new RegExp(s, "i"))

const firstCommittees = [
  "advanced information technology, the internet and cybersecurity",
  "bonding, capital expenditures and state assets",
  "cannabis policy",
  "children, families and persons with disabilities",
  "community development and small businesses",
  "consumer protection and professional licensure",
  "covid-19 and emergency preparedness and management",
  "economic development and emerging technologies",
  "higher education",
  "education",
  "elder affairs",
  "election laws",
  "environment, natural resources and agriculture",
  "export development",
  "financial services",
  "Housing and Food Security",
  "Housing and Local Aid Social Services and Veteran Services and Soldiers",
  "Housing Energy and Environmental Affairs and com_name",
  "housing",
  "the judiciary",
  "labor and workforce development",
  "mental health substance use and recovery",
  "municipalities and regional government",
  "public health",
  "public safety and homeland security",
  "public service",
  "racial equity, civil rights and inclusion ",
  "revenue",
  "state administration and regulatory oversight",
  "telecommunications, utilities and energy",
  "tourism, arts and cultural development",
  "transportation",
  "Veterans and Federal Affairs",
  "House Bills in Third",
  "Election Laws",
  "Transportation"
].map(s => new RegExp(s, "i"))

type MatchStatus = [(history: BillHistory) => boolean, Stage]

const stageChecks: MatchStatus[] = [
  [isSigned, Stage.signed],
  [inSecondChamber, Stage.secondChamber],
  [inFirstChamber, Stage.firstChamber],
  [hasSecondCommittees, Stage.secondCommittee],
  [hasFirstCommittees, Stage.firstCommittee]
]

export function predictBillStatus(newHistory: BillHistory): Stage {
  for (let [p, r] of stageChecks) {
    if (p(newHistory.reverse())) {
      return r
    }
  }
  return Stage.billIntroduced
}

function hasFirstCommittees(history: BillHistory) {
  for (let h of history) {
    for (let c of firstCommittees) {
      if (h.Action.match(c)) return true
    }
  }
  return false
}

function hasSecondCommittees(history: BillHistory) {
  for (let h of history) {
    for (let c of chamberCommittees) {
      if (h.Action.match(c)) {
        console.log(c)
        return true
      }
    }
  }
  return false
}

function inFirstChamber(history: BillHistory) {
  const chamberActions = ["orders of the day", "reported"].map(
    s => new RegExp(s, "i")
  )
  for (let h of history) {
    for (let c of chamberActions) {
      if (h.Action.match(c)) return true
    }
  }
  return false
}

function inSecondChamber(history: BillHistory) {
  const chamberActions = ["engrossed"].map(s => new RegExp(s, "i"))
  for (let h of history) {
    for (let c of chamberActions) {
      if (h.Action.match(c)) return true
    }
  }
  return false
}

function isSigned(history: BillHistory) {
  const commRegex = new RegExp("signed by the governor", "i")
  for (let h of history) {
    if (h.Action.match(commRegex)) return true
  }
  return false
}
