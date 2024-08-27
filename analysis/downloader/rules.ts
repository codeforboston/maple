import { Rules } from "./types"

const rollCall = (action: string) => {
  return (
    /see Roll Call #(\d+)/.exec(action)?.[1] ??
    /See YEA and NAY No. (\d+)/.exec(action)?.[1]
  )
}
const bill = (action: string) => /([HhSs]\d+)/.exec(action)![0]
const billList = (action: string) =>
  /([HhSs]\d+)((,| and) [HhSs]\d+)*/.exec(action)![0].split(/, | and /)
const inConcurrence = (action: string) => /in concurrence/.test(action)
const asAmended = (action: string) => /as amended/.test(action)
const standingVote = (action: string) => {
  const match = /standing vote \((\d+) to (\d+)\)/.exec(action)
  if (match) return { yeas: match[1], nays: match[2] }
}
const referred = /referred .*to (the )?(temporary )?committee on/i
const referredTo = (action: string) =>
  RegExp(referred.source + " (.*)", "i").exec(action)?.[3]
const source = (action: string) => {
  const result = /\((.*?)\)/i.exec(action)?.[1]
  return result && !/yea and nay|see text/i.test(result) ? result : undefined
}

// TODO: Reduce number of overall types, instead extract attributes from actions
// since some actions can contain multiple logical actions (i.e. both referred
// and reported)
export const rules: Rules = {
  accompanied: {
    recognize: /^(accompanied|accompanying)(?! by)/i,
    extract(action) {
      return {
        newDraft: /new draft/i.test(action),
        studyOrder: /study order/i.test(action),
        billId: bill(action)
      }
    }
  },
  accompaniedBy: {
    recognize: /^(accompanied by)/i,
    extract(action) {
      return {
        billIds: billList(action)
      }
    }
  },
  adopted: {
    recognize: /^(adopted)/i,
    extract: action => ({
      inConcurrence: inConcurrence(action),
      rollCallId: rollCall(action),
      asAmended: asAmended(action),
      standingVote: standingVote(action)
    })
  },
  accepted: {
    recognize: /^(accepted)/i,
    extract: action => ({ inConcurrence: inConcurrence(action) })
  },
  amendment: {
    recognize: /^(amended|amendment)(?! again agreed to)/i,
    extract(action) {
      return {
        rollCallId: rollCall(action),
        source: source(action),
        ...this.type(action)
      }
    },
    type(action: string) {
      let r
      if ((r = this.textReplacement(action))) {
        return { type: "textReplacement", billId: r }
      } else if ((r = this.substitution(action))) {
        return { type: "substitution", billId: r }
      } else if ((r = this.amendment(action))) {
        return { type: "amendment", ...r }
      } else {
        return { type: "unknown" }
      }
    },
    amendment: (action: string) => {
      const match =
        /amendment #?(?<amendmentId>[\d.]+)? ?(?<action>adopted|rejected|laid aside on a point of order|laid aside as duplicative|laid aside as beyond the scope of the bill|laid aside)/i.exec(
          action
        )
      if (match?.groups) {
        const { amendmentId, action } = match.groups
        return { amendmentId, action }
      }
    },
    textReplacement: (action: string) => {
      const match =
        /(?:place thereof t?he text of|place a duplicate of the text of) (House document numbered |[HhSs])(\d+)/.exec(
          action
        )
      if (match) {
        const [_, branch, number] = match,
          prefix = branch.startsWith("House") ? "H" : branch
        return `${prefix}${number}`
      }
    },
    substitution: (action: string) =>
      /substitution of a bill.*?([HhSs]\d+)/.exec(action)?.[1]
  },
  report: {
    recognize:
      /^(resolve|bill|order|committee|resolutions?|proposal for constitutional amendment)? ?reported/i,
    extract(action) {
      return {
        type: /reported favorably/.test(action) ? "favorable" : "unknown",
        asChanged: /as changed/.test(action),
        referredTo: referredTo(action),
        byCommittee: /by committee|^Committee/.test(action),
        oughtToBeAdopted: /ought to be adopted/.test(action),
        placedInOrdersOfTheDay:
          /placed in the Orders of the Day for the next session/.test(action)
      }
    }
  },
  rulesSuspended: {
    recognize: /^Rules suspended/
  },
  houseConcurred: {
    recognize: /^House concurred/
  },
  senateConcurred: {
    recognize: /^Senate concurred/
  },
  newDraft: {
    recognize: /new draft of/i,
    extract(action) {
      return {
        billIds: billList(action)
      }
    }
  },
  referred: {
    recognize: RegExp("(?<!(reported.*))" + referred.source, "i"),
    extract(action) {
      return {
        referredTo: referredTo(action),
        onMotion: /on motion/.test(action),
        source: source(action)
      }
    }
  },
  discharged: {
    recognize: /^Discharged to the committee on/,
    extract(action) {
      return {
        dischargedTo: /discharged to the committee on (.*)/i.exec(action)?.[1]
      }
    }
  },
  emergencyPreambleAdopted: {
    recognize: /^Emergency preamble adopted$/
  },
  enacted: {
    recognize: /^Enacted|^Again enacted|^Re-enacted/,
    extract(action) {
      return {
        rollCallId: rollCall(action),
        asSection: this.asSection(action),
        reEnacted: /^Re-enacted|^Again enacted/.test(action),
        laidBeforeTheGovernor: /laid before the Governor/.test(action)
      }
    },
    asSection(action: string) {
      if (action.startsWith("Enacted as section")) {
        const sections = Array.from(action.matchAll(/\b\d+\b/g)).map(
          ([section]) => section
        )
        const billId = /[HhSs]\d+/.exec(action)![0]
        return { sections, billId }
      }
    }
  },
  hearing: {
    recognize: /Hearing (scheduled|rescheduled|canceled)/,
    extract(action) {
      return {
        action: action.includes("Hearing canceled")
          ? "canceled"
          : action.includes("Hearing scheduled")
          ? "scheduled"
          : action.includes("Hearing rescheduled")
          ? "rescheduled"
          : "unknown",
        format: /in (.*?)$/.exec(action)?.[1],
        locationChanged: action.includes("Location Changed"),
        time: /(?:scheduled from|scheduled for|rescheduled to) (.*) in/.exec(
          action
        )?.[1]
      }
    }
  }
}
