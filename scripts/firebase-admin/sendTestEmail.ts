import * as handlebars from "handlebars"
import * as fs from "fs"
import { Script } from "./types"
import * as helpers from "../../functions/src/email/helpers"

import {
  BillDigest,
  NotificationEmailDigest,
  OrgDigest
} from "functions/src/email/types"
import { Record, String } from "runtypes"
import { Timestamp } from "functions/src/firebase"
import * as juice from "juice"

const path = require("path")

const PARTIALS_DIR = "./functions/src/email/partials/"
const EMAIL_TEMPLATE_PATH = "./functions/src/email/digestEmail.handlebars"

const CSS_PATH = "../../public/email/emailStyle.css"
const CSS_CONTENT = fs.readFileSync(path.join(__dirname, CSS_PATH), "utf8")

// Define Handlebars helper functions
handlebars.registerHelper("toLowerCase", helpers.toLowerCase)
handlebars.registerHelper("noUpdatesFormat", helpers.noUpdatesFormat)
handlebars.registerHelper("isDefined", helpers.isDefined)
function registerPartials(directoryPath: string) {
  console.log("REGISTERING PARTIALS")

  const filenames = fs.readdirSync(directoryPath)

  filenames.forEach(filename => {
    const partialPath = path.join(directoryPath, filename)
    const stats = fs.statSync(partialPath)

    if (stats.isDirectory()) {
      // Recursive call for directories
      registerPartials(partialPath)
    } else if (stats.isFile() && path.extname(filename) === ".handlebars") {
      // Register partials for .handlebars files
      const partialName = path.basename(filename, ".handlebars")
      const partialContent = fs.readFileSync(partialPath, "utf8")
      handlebars.registerPartial(partialName, partialContent)
    }
  })
}

const renderToHtmlString = (digestData: NotificationEmailDigest) => {
  // TODO: Can we register these earlier since they're shared across all notifs - maybe at startup?
  registerPartials(PARTIALS_DIR)

  //  console.log("DEBUG: Working directory: ", process.cwd())
  //  console.log(
  //    "DEBUG: Digest template path: ",
  //    path.resolve(EMAIL_TEMPLATE_PATH)
  //  )

  //  const templateSource = fs.readFileSync(
  //    path.resolve(EMAIL_TEMPLATE_PATH),
  //    "utf8"
  //  )
  //  const compiledTemplate = handlebars.compile(templateSource)
  //  const htmlString = compiledTemplate({ digestData })

  const fs = require("fs")

  // Read the HTML file synchronously
  let htmlString = fs.readFileSync("./public/email.html", "utf8")
  // Inline CSS using Juice
  const inlinedHtml = juice.inlineContent(htmlString, CSS_CONTENT, {
    preserveMediaQueries: true,
    removeStyleTags: true
  })

  return inlinedHtml
}

const Args = Record({ email: String })

export const script: Script = async ({ db, args }) => {
  const { email } = Args.check(args)
  const billDigest1: BillDigest = {
    billNumber: "H.1289",
    billTitle:
      "An Act Prohibiting the use of Native American mascots by public schools in the Commonwealth",
    testimonies: 12,
    endorseCount: 6,
    neutralCount: 4,
    opposeCount: 2
  }

  const billDigest2: BillDigest = {
    billNumber: "H.1289",
    billTitle:
      "An Act Prohibiting the use of Native American mascots by public schools in the Commonwealth",
    testimonies: 12,
    endorseCount: 6,
    neutralCount: 4,
    opposeCount: 2
  }

  const orgDigest1: OrgDigest = {
    orgTitle: "Boston’s Teacher Union",
    counter: 6,
    items: [
      { title: "S.128", icon: "up" },
      { title: "H.1000", icon: "down" },
      { title: "S.128", icon: "up" },
      { title: "H.1000", icon: "down" },
      { title: "S.128", icon: "neutral" },
      { title: "S.128", icon: "neutral" }
    ],
    userLookup: "boston-teacher-union"
  }

  const orgDigest2: OrgDigest = {
    orgTitle: "American Promise",
    counter: 5,
    items: [
      { title: "S.128", icon: "up" },
      { title: "H.1000", icon: "down" },
      { title: "S.128", icon: "up" },
      { title: "H.1000", icon: "down" },
      { title: "S.128", icon: "neutral" }
    ],
    userLookup: "american-promise"
  }

  const startDate = new Date()

  const digestData: NotificationEmailDigest = {
    notificationFrequency: "Monthly",
    startDate: startDate,
    endDate: startDate,
    bills: [billDigest1, billDigest2],
    orgs: [orgDigest1, orgDigest2],
    numBillsWithNewTestimony: 2,
    numUsersWithNewTestimony: 2
  }

  const htmlString = renderToHtmlString(digestData)

  // Create an email document in /notifications_mails to queue up the send
  await db.collection("emails").add({
    to: [email],
    replyTo: "noreply@yourdomain.com",
    message: {
      subject: "Test Notifications Digest",
      text: "test", // blank because we're sending HTML
      html: htmlString
    },
    createdAt: Timestamp.now()
  })
}
