import { auth, db } from "./firebase"
import type * as api from "./malegislature"
import { app } from "./firebase"

export type Database = typeof db
export type Admin = typeof auth
export type Auth = typeof auth
export type Firebase = typeof app
export type Api = typeof api

export type Context = {
  env: "dev" | "prod" | "local"
  firebase: Firebase
  db: Database
  admin: Admin
  auth: Auth
  api: Api
}

export type EventData = {
  index: number
  type: "hearing" | "session"
  name: string
  id: number
  location: string
  fullDate: Date // TODO: Could be a timestamp
  year: string
  month: string
  date: string
  day: string
  time: string
  relatedBills?: RelatedBill[]
  relatedOrgs?: RelatedOrg[]
}

// types for Bills and Orgs
export type RelatedBill = {
  id: string
  court: number
}

export type RelatedOrg = {
  id: string
}
