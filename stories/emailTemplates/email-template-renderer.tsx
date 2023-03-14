import Handlebars from "handlebars/dist/handlebars"
import { FC, useEffect, useState } from "react"

import bill from "functions/src/email/partials/bills/bill.handlebars"
import bills from "functions/src/email/partials/bills/bills.handlebars"
import footer from "functions/src/email/partials/footer.handlebars"
import header from "functions/src/email/partials/header.handlebars"
import newsFeedLink from "functions/src/email/partials/newsFeedLink.handlebars"
import noUpdates from "functions/src/email/partials/noUpdates.handlebars"
import orgs from "functions/src/email/partials/orgs/orgs.handlebars"

const partials = { bill, bills, footer, header, newsFeedLink, noUpdates, orgs }
let loadedPartials: Promise<any> | undefined
const loadPartials = async () => {
  if (loadedPartials) return loadPartials
  for (const [name, url] of Object.entries(partials)) {
    const partial = await fetch(url).then(p => p.text())
    Handlebars.registerPartial(name, partial)
  }
}

/** Given a URL to a handlebars template, render it using the provided context data. */
export const EmailTemplateRenderer: FC<{
  templateSrcUrl: string
  context: any
}> = ({ templateSrcUrl, context }) => {
  const [html, setHtml] = useState<string | undefined>()
  useEffect(() => {
    loadPartials()
      .then(() => fetch(templateSrcUrl))
      .then(r => r.text())
      .then(raw => Handlebars.compile(raw)(context))
      .then(setHtml)
  }, [context, templateSrcUrl])
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null
}
