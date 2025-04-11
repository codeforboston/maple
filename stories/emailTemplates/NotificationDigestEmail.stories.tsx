import { Meta, StoryObj } from "@storybook/react"
import digestEmail from "functions/src/email/digestEmail.handlebars"
import { EmailTemplateRenderer } from "./EmailTemplateRenderer"
import {
  BillDigest,
  BillResult,
  NotificationEmailDigest,
  UserDigest
} from "functions/src/notifications/emailTypes"
import { Frequency } from "components/auth"

const meta: Meta = {
  title: "Email Templates/Notifications Digest",
  component: EmailTemplateRenderer,
  decorators: [
    Story => (
      // Use a narrow window to represent an email client
      // TODO: May need to update to match styling of a real email client
      <div style={{ background: "white", width: "600px", minHeight: "80vh" }}>
        <Story />
      </div>
    )
  ]
}

export default meta

type Story = StoryObj<typeof EmailTemplateRenderer>

// Generate test data for the digest email

// Summary of Bills
const bills: BillDigest[] = [
  {
    billId: "H868",
    billName:
      "An Act improving campaign finance reporting by state ballot question committees",
    billCourt: "194",
    newTestimonyCount: 1005,
    endorseCount: 2,
    neutralCount: 0,
    opposeCount: 1
  },
  {
    billId: "H1436",
    billName: "An Act relative to debt-free public higher education",
    billCourt: "194",
    newTestimonyCount: 3,
    endorseCount: 2,
    neutralCount: 0,
    opposeCount: 0
  },
  {
    billId: "H533",
    billName: "An Act to expand the use of career and academic plans",
    billCourt: "194",
    newTestimonyCount: 7,
    endorseCount: 10,
    neutralCount: 2,
    opposeCount: 24
  },
  {
    billId: "H841",
    billName:
      "An Act granting the city of Boston the authority to endow legal voting rights in municipal elections for city of Boston residents aged 16 and 17 years old",
    billCourt: "194",
    newTestimonyCount: 0,
    endorseCount: 35,
    neutralCount: 20,
    opposeCount: 10
  },
  {
    billId: "H54",
    billName:
      "An Act to build resilient infrastructure to generate higher-ed transformation",
    billCourt: "194",
    newTestimonyCount: 9,
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
    bills: billResults.slice(0, Math.min(6, numBillsWithTestimony)),
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
  const testStartDate = new Date("2025-04-01T04:00:00Z")
  const testStartMonth = testStartDate.getMonth() + 1 // Month is 0-indexed
  const testStartDay = testStartDate.getDate()
  const testStartYear = testStartDate.getFullYear()
  const testStartformattedDate = `${testStartMonth}/${testStartDay}/${testStartYear}`

  const testEndDate = new Date(
    `2025-04-${frequency === "Monthly" ? "30" : "07"}T04:00:00Z`
  )
  const testEndMonth = testEndDate.getMonth() + 1 // Month is 0-indexed
  const testEndDay = testEndDate.getDate()
  const testEndYear = testEndDate.getFullYear()
  const testEndformattedDate = `${testEndMonth}/${testEndDay}/${testEndYear}`

  return {
    notificationFrequency: frequency,
    startDate: testStartformattedDate,
    endDate: testEndformattedDate,
    bills: bills.slice(0, Math.min(4, numBills)),
    users: users.slice(0, Math.min(4, numUsers)),
    numBillsWithNewTestimony: numBills,
    numUsersWithNewTestimony: numUsers
  }
}

// Frequency is guaranteed to be Monthly or Weekly,
// and there must be at least 1 bill OR 1 user with testimony
// or else a digest wouldn't be generated
const createDigestStory = (context: NotificationEmailDigest) => {
  return {
    args: {
      templateSrcUrl: digestEmail,
      context
    }
  }
}

export const FullDigest: Story = createDigestStory(
  generateTestData("Monthly", 4, 4)
)

export const OnlyBills: Story = createDigestStory(
  generateTestData("Weekly", 4, 0)
)

export const OnlyUsers: Story = createDigestStory(
  generateTestData("Weekly", 0, 4)
)

export const TooManyBills: Story = createDigestStory(
  generateTestData("Monthly", 100, 0)
)

export const TooManyUsers: Story = createDigestStory(
  generateTestData("Monthly", 0, 100)
)

export const TooManyBillsAndUsers: Story = createDigestStory(
  generateTestData("Monthly", 100, 100)
)
