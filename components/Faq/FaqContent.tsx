import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import style from "./Faq.module.css"

export const FaqContent = (props: { faq: string | undefined }) => {
  const [content, setContent] = useState("")
  const mdpath = `/${props.faq}.md`

  useEffect(() => {
    fetch(mdpath)
      .then(res => res.text())
      .then(text => setContent(text))
  }, [mdpath])

  return (
    <div>
      <ReactMarkdown className={style.faqContent}>{content}</ReactMarkdown>
    </div>
  )
}
