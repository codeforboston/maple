import { firestore } from "components/firebase"
import {
  QuerySnapshot,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  writeBatch
} from "firebase/firestore"
import { first } from "lodash"
import { GetListParams, RaRecord } from "ra-core/src/types"
import {
  CreateParams,
  CreateResult,
  GetManyParams,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  UpdateManyParams,
  UpdateManyResult,
  UpdateParams,
  UpdateResult
} from "react-admin"

export async function queryCollectionGroup(
  resource: string,
  params?: GetListParams
) {
  const filters = Object.entries(params?.filter)
  const myquery = query(
    collectionGroup(firestore, resource),
    ...filters.map(([k, v]) => where(k, "==", v))
  )
  const querySnapshot = await getDocs(myquery)
  return querySnapshot
}

export async function queryCollectionSingle(
  resource: string,
  params?: GetListParams
) {
  const filters = Object.entries(params?.filter)
  const myCollection = collection(firestore, resource)
  const q = query(myCollection, ...filters.map(([k, v]) => where(k, "==", v)))
  const snap = await getDocs(q)
  return snap
}

export async function queryWhereIn(resource: string, ids: string[]) {
  const q = query(collection(firestore, resource), where("id", "in", ids))
  const snap = await getDocs(q)
  const data = snap.docs.map(d => d.data())
  return data
}

const collectionGroupResources = ["publishedTestimony", "archivedTestimony"]

export const getMyOne = async (
  resource: string,
  params: GetOneParams
): Promise<GetOneResult> => {
  let data, docId
  if (collectionGroupResources.includes(resource)) {
    let snap: QuerySnapshot
    snap = await getDocs(
      query(
        collectionGroup(firestore, resource),
        where("id", "==", params.id),
        limit(1)
      )
    )
    if (!snap.empty) {
      const doc = first(snap.docs)
      if (doc?.exists()) {
        data = doc.data()
        docId = first(snap?.docs)?.id
      }
    }
  } else {
    const docRef = doc(firestore, resource, params.id)
    const result = await getDoc(docRef)
    if (result.exists()) {
      data = result.data()
      docId = docRef.id
    }
  }
  const raData = data ? { ...data, id: docId } : { id: docId }
  return { data: raData }
}

const listParamsDefault = {
  filter: {},
  sort: { field: "date", order: "DESC" },
  pagination: { page: 1, perPage: 50 }
}

interface ListResult<RecordType extends RaRecord = any> {
  data: RecordType[]
  total?: number
  pageInfo?: any
}

export async function getMyMany<RecordType extends RaRecord>(
  resourceName: string,
  params: GetManyParams
): Promise<GetManyResult> {
  const data = await queryWhereIn(resourceName, params.ids as string[])
  const total = undefined
  const pageInfo = undefined

  const result = { data, total, pageInfo }

  return result
}

export async function updateMyMany<RecordType extends RaRecord = any>(
  resource: string,
  params: UpdateManyParams
): Promise<UpdateManyResult> {
  console.log("updating my many")
  const { ids, data, meta } = params
  const batch = writeBatch(firestore)
  ids.forEach(id => {
    const ref = doc(firestore, id as string)
    batch.update(ref, data)
  })
  await batch.commit()

  return { data: data }
}

export async function updateMyOne(
  resource: string,
  params: UpdateParams
): Promise<UpdateResult> {
  console.log("updating my one", params)
  const { id, data, previousData } = params
  const ref = doc(firestore, resource, id as string)
  await setDoc(ref, data, { merge: true })
  return { data: data }
}

export async function createMyOne(
  resource: string,
  params: CreateParams
): Promise<CreateResult> {
  console.log("creating my one")
  const { data, meta } = params
  const ref = doc(firestore, resource, data.id)
  await setDoc(ref, data)
  return { data: data }
}

export const getMyListGroup = async (
  resource: string,
  params: GetListParams = listParamsDefault
) => {
  let snap: QuerySnapshot
  if (collectionGroupResources.includes(resource)) {
    snap = await queryCollectionGroup(resource, params)
  } else {
    snap = await queryCollectionSingle(resource, params)
  }
  const docs = snap.docs
  const result: ListResult = {
    data: docs.map(doc => {
      const baseData = doc.data()
      return { id: doc.ref.id, ...baseData } as RaRecord
    }),
    total: snap.size,
    pageInfo: null
  }
  return result
}
