import {
  Array,
  Dictionary,
  InstanceOf,
  Record,
  Static,
  String,
  Unknown
} from "runtypes"

export const Action = Record({
  id: String,
  action: String,
  branch: String,
  date: InstanceOf(Date)
})
export type Action = Static<typeof Action>
export const History = Array(Action)
export type History = Static<typeof History>

export const Context = Dictionary(Unknown, String)
export type Context = Static<typeof Context>

export type Rules = {
  [type: string]: {
    recognize: RegExp | ((action: string) => boolean)
    extract?: (action: string) => Context
    [k: string]: any
  }
}

export const ClassifiedAction = Action.extend({
  type: String,
  context: Context
})
export type ClassifiedAction = Static<typeof ClassifiedAction>
