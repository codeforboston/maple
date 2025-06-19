import * as handlebars from "handlebars"
import * as fs from "fs"
import { Script } from "./types"
import * as helpers from "../../functions/src/email/helpers"

import {
  BillDigest,
  BillResult,
  NotificationEmailDigest,
  UserDigest
} from "functions/src/notifications/emailTypes"
import { Record, String } from "runtypes"
import { Timestamp } from "functions/src/firebase"
import { Frequency } from "components/auth"

const path = require("path")

const PARTIALS_DIR = "./functions/src/email/partials/"
const EMAIL_TEMPLATE_PATH = "./functions/src/email/digestEmail.handlebars"

// Define Handlebars helper functions
handlebars.registerHelper("addCounts", helpers.addCounts)
handlebars.registerHelper("ifGreaterThan", helpers.ifGreaterThan)
handlebars.registerHelper("isDefined", helpers.isDefined)
handlebars.registerHelper("formatDate", helpers.formatDate)
handlebars.registerHelper("minusFour", helpers.minusFour)
handlebars.registerHelper("noUpdatesFormat", helpers.noUpdatesFormat)
handlebars.registerHelper("toLowerCase", helpers.toLowerCase)
handlebars.registerHelper("pluralize", helpers.pluralize)

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

  console.log("DEBUG: Working directory: ", process.cwd())
  console.log(
    "DEBUG: Digest template path: ",
    path.resolve(EMAIL_TEMPLATE_PATH)
  )

  const templateSource = fs.readFileSync(
    path.resolve(EMAIL_TEMPLATE_PATH),
    "utf8"
  )
  const compiledTemplate = handlebars.compile(templateSource)
  return compiledTemplate(digestData)
}

// Summary of Bills
const bills: BillDigest[] = [
  {
    billId: "H868",
    billName:
      "An Act improving campaign finance reporting by state ballot question committees",
    billCourt: "194",
    endorseCount: 2,
    neutralCount: 0,
    opposeCount: 1
  },
  {
    billId: "H1436",
    billName: "An Act relative to debt-free public higher education",
    billCourt: "194",
    endorseCount: 2,
    neutralCount: 0,
    opposeCount: 0
  },
  {
    billId: "H533",
    billName: "An Act to expand the use of career and academic plans",
    billCourt: "194",
    endorseCount: 10,
    neutralCount: 2,
    opposeCount: 24
  },
  {
    billId: "H841",
    billName:
      "An Act granting the city of Boston the authority to endow legal voting rights in municipal elections for city of Boston residents aged 16 and 17 years old",
    billCourt: "194",
    endorseCount: 35,
    neutralCount: 20,
    opposeCount: 10
  },
  {
    billId: "H54",
    billName:
      "An Act to build resilient infrastructure to generate higher-ed transformation",
    billCourt: "194",
    endorseCount: 0,
    neutralCount: 0,
    opposeCount: 1
  }
]

const billResults: BillResult[] = [
  {
    billId: "H868",
    court: "194",
    position: "endorse"
  },
  {
    billId: "H1436",
    court: "194",
    position: "neutral"
  },
  {
    billId: "H533",
    court: "194",
    position: "oppose"
  },
  {
    billId: "H841",
    court: "194",
    position: "endorse"
  },
  {
    billId: "H54",
    court: "194",
    position: "oppose"
  },
  {
    billId: "H66",
    court: "194",
    position: "neutral"
  },
  {
    billId: "H30",
    court: "194",
    position: "endorse"
  }
]

const generateTestUserData = (
  userId: string,
  userName: string,
  numBillsWithTestimony: number
): UserDigest => {
  return {
    userId,
    userName,
    bills: billResults.slice(0, Math.min(7, numBillsWithTestimony)), // need a potential 7th bill to trigger 'See more' option
    newTestimonyCount: numBillsWithTestimony
  }
}

const users = [
  generateTestUserData("0BvO7rSlFjRVHuLfd7RlHRYg2DN1", "John Doe", 7),
  generateTestUserData("2jBTpZQ1kXVVSaJvLy2mxfduoc64", "Jane Roe", 6),
  generateTestUserData(
    "381slAnGbzP6atlF4Af4D9pYQT24",
    "Society for the Humane Prevention of Testimony",
    5
  ),
  generateTestUserData("Nyvk23VDNQSoK9TQ9LK5xF1DwT64", "Person McPersonson", 4),
  generateTestUserData("QDPq42rNB0O6wqVzfMmDHmNE8sN3", "Iranout Ofnameideas", 3)
]

const generateTestData = (
  frequency: Frequency,
  numBills: number,
  numUsers: number
): NotificationEmailDigest => {
  return {
    notificationFrequency: frequency,
    startDate: new Date("2025-04-01T04:00:00Z"),
    endDate: new Date(
      `2025-04-${frequency === "Monthly" ? "30" : "07"}T04:00:00Z`
    ),
    bills: bills.slice(0, Math.min(4, numBills)),
    users: users.slice(0, Math.min(4, numUsers)),
    numBillsWithNewTestimony: numBills,
    numUsersWithNewTestimony: numUsers
  }
}

const Args = Record({ email: String })

// Send a test email with:
//   yarn firebase-admin -e dev run-script sendTestEmail --email="youremail@example.com"
export const script: Script = async ({ db, args }) => {
  const { email } = Args.check(args)

  // Frequency is guaranteed to be Monthly or Weekly,
  // and there must be at least 1 bill OR 1 user with testimony
  // or else a digest wouldn't be generated
  const digestData = generateTestData("Monthly", 4, 4)

  // const onlyBills = generateTestData("Weekly", 4, 0)
  // const onlyUsers = generateTestData("Weekly", 0, 4)
  // const oddNumbers = generateTestData("Monthly", 1, 3)
  // const tooManyBills = generateTestData("Monthly", 100, 0)
  // const tooManyUsers = generateTestData("Monthly", 0, 100)
  // const tooManyBillsAndUsers = generateTestData("Monthly", 100, 100)

  const htmlString = renderToHtmlString(digestData)

  console.log("DEBUG: HTML String: ", htmlString)
  console.log("DEBUG: Email: ", email)

  // Create an email document in /notifications_mails to queue up the send
  const result = await db.collection("emails").add({
    to: [email],
    message: {
      subject: "Test Notifications Digest",
      html: htmlString
    },
    createdAt: Timestamp.now()
  })

  console.log("DEBUG: Email document created with ID: ", result.id)
}
