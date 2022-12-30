import { BillHistoryAction } from "functions/src/bills/types"
import { useEffect, useState } from "react"
import { Bill, getBill } from "./bills"

export enum Stage {
  billIntroduced = "Bill Introduced",
  firstCommittee = "First Committee",
  secondCommittee = "Second Committee",
  firstChamber = "First Chamber",
  secondChamber = "Second Chamber",
  signed = "Signed By Governor"
}

const labels = [
  ["orders of the day", "first_chamber"],
  ["reported", "first_chamber"],
  ["engrossed", "second_chamber"],
  ["signed by the governor", "signed by the governor"]
]

const first_committees = [
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
].map(s => new RegExp(s, 'i'))

const chamber_committees = [
  "committee on rules",
  "committee on rules of the two branches, acting concurrently",
  "committee on w* ways and means",
  "committee on w* steering, policy and scheduling",
  "committee on w* steering and policy",
  "committee on w* housing and finance",
  "committee on health care financing",
  "committee on bills in the third reading"
].map(s => new RegExp(s, 'i'))

const label_order = Object.values(Stage)

const hasFirstCommittees = (action: BillHistoryAction) => {
  for (let c of first_committees) {
    if (c.test(action.Action)) {
      console.log(c)
      return true
    }
  }
  return false
}

const hasSecondCommittees = (action: BillHistoryAction) => {
  for (let c of chamber_committees) {
    if (c.test(action.Action)) {
      console.log(c)
      return true
    }
  }
  return false
}

const inFirstChamber = (action: BillHistoryAction) => {
  const chamberActions = ["orders of the day", "reported"]
  chamberActions.forEach(com => {
    const commRegex = new RegExp(com, "i")
    return commRegex.test(action.Action)
  })
  return false
}

const inSecondChamber = (action: BillHistoryAction) => {
  const chamberActions = ["engrossed"]
  chamberActions.forEach(com => {
    const commRegex = new RegExp(com, "i")
    return commRegex.test(action.Action)
  })
  return false
}

const isSigned = (action: BillHistoryAction) => {
  const chamberActions = ["signed by the governor"]
  chamberActions.forEach(com => {
    const commRegex = new RegExp(com, "i")
    return commRegex.test(action.Action)
  })
  return false
}

export function useBillStatus(id: string) {
  const [currentStage, setCurrentStage] = useState<Stage>(Stage.billIntroduced)

  const [bill, setBill] = useState<Bill | undefined>()

  useEffect(() => {
    let active = true
    loadBill()
    return () => {
      active = false
    }

    async function loadBill() {
      const res = await getBill(id)
      if (!active) return
      setBill(res)
    }
  }, [id])

  useEffect(() => {
    if (bill?.history) {
      console.log('grading', bill.id)
      for (let h of bill?.history) {
        if (hasFirstCommittees(h)) {
          setCurrentStage(Stage.firstCommittee)
        }
        if (hasSecondCommittees(h)) {
          setCurrentStage(Stage.secondCommittee)
        }
        if (inFirstChamber(h)) {
          setCurrentStage(Stage.firstChamber)
        }
        if (inSecondChamber(h)) {
          setCurrentStage(Stage.secondChamber)
        }
        if (isSigned(h)) {
          setCurrentStage(Stage.signed)
        }
      }
    }
  }, [bill?.history, bill?.id])

  return { currentStage }
}
