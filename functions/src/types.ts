import type * as firebase from "./firebase"

export type Database = typeof firebase.db
export type Admin = typeof firebase.admin
export type Auth = typeof firebase.auth
export type Firebase = typeof firebase

export type Context = {
  firebase: Firebase
  db: Database
  admin: Admin
  auth: Auth
}
