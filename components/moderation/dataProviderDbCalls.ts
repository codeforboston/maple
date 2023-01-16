import { firestore } from "components/firebase"
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch
} from "firebase/firestore"
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

export async function queryCollectionGroup(resource: string) {
  const myquery = query(collectionGroup(firestore, resource))
  const querySnapshot = await getDocs(myquery)
  return querySnapshot
}
export async function queryCollectionSingle(resource: string) {
  const myCollection = collection(firestore, resource)
  const snap = await getDocs(myCollection)
  return snap
}

export async function queryWhereIn(resource: string, ids: string[]) {
  const q = query(collection(firestore, resource), where("id", "in", ids))
  const snap = await getDocs(q)
  const data = snap.docs.map(d => d.data())
  return data
}

export const getMyOne = async (
  resource: string,
  params: GetOneParams
): Promise<GetOneResult> => {
  console.log("getMyONe")
  const docRef = doc(firestore, params.id)
  const data = await getDoc(docRef).then(doc => doc.data())
  const raData = data && { ...data, id: docRef.path }
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
  const ref = doc(firestore, id as string)
  console.log(ref.path)
  await setDoc(ref, data, { merge: true })
  return { data: data }
}

export async function createMyOne(
  resource: string,
  params: CreateParams
): Promise<CreateResult> {
  console.log("creating my one")
  const { data, meta } = params
  const ref = doc(firestore, data.id)
  await setDoc(ref, data)
  return { data: data }
}

export const getMyListGroup = async (
  resource: string,
  params: GetListParams = listParamsDefault
) => {
  const snap = await queryCollectionGroup(resource)
  const docs = snap.docs
  const result: ListResult = {
    data: docs.map(doc => {
      const baseData = doc.data()
      return { id: doc.ref.path, ...baseData } as RaRecord
    }),
    total: snap.size,
    pageInfo: null
  }

  return result
}

export const getMyListCollection = async (
  resource: string,
  params: GetListParams = listParamsDefault
) => {
  const snap = await queryCollectionSingle(resource)
  const docs = snap.docs
  const result: ListResult = {
    data: docs.map(doc => {
      return { id: doc.ref.path, ...doc.data() }
    }),
    total: snap.size,
    pageInfo: null
  }

  return result
}
