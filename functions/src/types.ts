import type * as firebase from "./firebase"

export type Context = {
  firebase: typeof firebase
  db: typeof firebase.db
  admin: typeof firebase.admin
  auth: typeof firebase.auth
}
