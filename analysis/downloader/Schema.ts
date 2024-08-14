import { Action, ClassifiedAction, Context, Rules } from "./types"

export class Schema {
  private schema
  constructor(rules: Rules) {
    this.schema = Object.entries(rules).map(([type, rule]) => {
      let recognize
      if (typeof rule.recognize === "function") {
        recognize = rule.recognize.bind(rule)
      } else {
        const re = rule.recognize
        recognize = (action: string) => re.test(action)
      }
      return { type, recognize, extract: rule.extract?.bind(rule) }
    })
  }

  classify(action: Action) {
    const matches: { type: string; context: Context }[] = []
    this.schema.forEach(({ type, recognize, extract }, i) => {
      const isType = recognize(action.action)
      if (isType) {
        const context = extract?.(action.action) ?? {}
        matches.push({
          type,
          context: dropFalsy(context)
        })
      }
    })
    const classified: ClassifiedAction = {
      ...action,
      type:
        matches.length === 0
          ? "unknown"
          : matches.length === 1
            ? matches[0].type
            : "conflicting",
      context:
        matches.length === 0
          ? {}
          : matches.length === 1
            ? matches[0].context
            : { types: matches.map(({ type }) => type) }
    }
    return classified
  }
}

function dropFalsy(context: {}) {
  return Object.fromEntries(
    Object.entries(context).filter(([_, v]) => Boolean(v))
  )
}
