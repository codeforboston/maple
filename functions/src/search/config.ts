import { CollectionReference } from "@google-cloud/firestore"
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections"
import { DocumentData } from "../firebase"

export type Schema = Omit<CollectionCreateSchema, "name">
export type CollectionConfig = {
  readonly alias: string
  readonly schema: Schema
  readonly sourceCollection: CollectionReference
  readonly idField: string
  readonly convert: (data: DocumentData) => { id: string }
}

const registered: CollectionConfig[] = []
export const registerConfig = (config: CollectionConfig) => {
  registered.push(config)
}
export const getRegisteredConfigs = () => registered
