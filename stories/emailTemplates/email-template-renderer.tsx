import Handlebars from "handlebars"
import { FC, useEffect, useState } from "react"

/** Given a URL to a handlebars template, render it using the provided context data. */
export const EmailTemplateRenderer: FC<{
  templateSrcUrl: string
  context: any
}> = ({ templateSrcUrl, context }) => {
  const [html, setHtml] = useState<string | undefined>()
  useEffect(() => {
    fetch(templateSrcUrl)
      .then(r => r.text())
      .then(raw => Handlebars.compile(raw)(context))
      .then(setHtml)
  }, [context, templateSrcUrl])
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null
}
