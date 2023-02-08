import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import style from "./PolicyPage.module.css"

export const PolicyContent = (props: { policy: string | undefined }) => {
  const [content, setContent] = useState("")
  const mdpath = `${props.policy}.md`

  useEffect(() => {
    fetch(mdpath)
      .then(res => res.text())
      .then(text => setContent(text))
  }, [mdpath])

  return (
    <div>
      <ReactMarkdown className={style.policyContent}>{content}</ReactMarkdown>
    </div>
  )
}
