import { partials } from "functions/src/email/partials"
import * as helpers from "functions/src/email/helpers"
import Handlebars from "handlebars/dist/handlebars"
import { FC, useEffect, useState } from "react"

const loadHandlebars = async () => {
  for (const [name, url] of Object.entries(partials)) {
    const partial = await fetch(url).then(p => p.text())
    Handlebars.registerPartial(name, partial)
  }
  Handlebars.registerHelper({ ...helpers })
}

/** Given a URL to a handlebars template, render it using the provided context data. */
export const EmailTemplateRenderer: FC<{
  templateSrcUrl: string
  context: any
}> = ({ templateSrcUrl, context }) => {
  const [html, setHtml] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  useEffect(() => {
    setError(undefined)
    loadHandlebars()
      .then(() => fetch(templateSrcUrl))
      .then(r => r.text())
      .then(raw => Handlebars.compile(raw)(context))
      .then(setHtml)
      .catch(e => {
        console.error("Failed to render email template", e)
        setHtml(undefined)
        setError(e instanceof Error ? e.message : String(e))
      })
  }, [context, templateSrcUrl])
  if (error) {
    return (
      <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>
        Failed to render email template: {error}
      </pre>
    )
  }
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null
}
