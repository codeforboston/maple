import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore"
import { useAsync } from "react-async-hook"
import { firestore } from "../firebase"

export type NewsType = "article" | "award" | "book"

export type NewsItem = {
  id: string
  url: string
  title: string
  author: string
  type: NewsType
  description?: string
  publishDate: string
  createdAt: Timestamp
}

export async function listNews(): Promise<NewsItem[]> {
  const newsRef = collection(firestore, "news")
  const q = query(newsRef, orderBy("publishDate", "desc"))
  const result = await getDocs(q)
  return result.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem))
}

export function useNews() {
  return useAsync(listNews, [])
}
