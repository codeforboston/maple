import type * as firebase from "../../functions/src/firebase"

export type Context = {
  firebase: typeof firebase
  db: typeof firebase.db
  admin: typeof firebase.admin
}

export type Script = (ctx: Context) => Promise<any>
