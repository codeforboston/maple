import { Meta, StoryObj } from "@storybook/react"
import digestEmail from "functions/src/email/digestEmail.handlebars"
import { EmailTemplateRenderer } from "./EmailTemplateRenderer"

const meta: Meta = {
  title: "Email Templates/Digest",
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

export const DigestEmail: Story = {
  args: {
    templateSrcUrl: digestEmail,
    context: {
      notificationFrequency: "Monthly",
      startDate: "2/1/2023",
      endDate: "2/7/2023",
      bill: {
        1: {
          title: "H.1289",
          subtitle:
            "An Act to protect the civil rights and safety of all Massachusetts residents",
          testimonies: "12",
          cosponsors: "2",
          hearingDate: "Jan 31"
        },
        2: {
          title: "H.98",
          subtitle: "An Act to further govt. transparency",
          testimonies: "2",
          cosponsors: "0",
          hearingDate: "-"
        }
      },
      org: {
        1: {
          orgTitle: "Boston’s Teacher Union",
          userLookup: "Tfh1tp2faYbSWsYYsvUS4F23mtD2",
          counter: "3",
          item: {
            1: {
              title: "S.77",
              icon: "endorse"
            },
            2: {
              title: "S.77",
              icon: "neutral"
            },
            3: {
              title: "S.77",
              icon: "neutral"
            }
          }
        },
        2: {
          orgTitle: "Moms for Liberty",
          userLookup: "c31R5rjWG9eTUopP7yeA5tZQtJX2",
          counter: "6",
          item: {
            1: {
              title: "S.128",
              icon: "endorse"
            },
            2: {
              title: "S.1000",
              icon: "neutral"
            },
            3: {
              title: "S.543",
              icon: "oppose"
            },
            4: {
              title: "S.767",
              icon: "endorse"
            },
            5: {
              title: "S.992",
              icon: "neutral"
            },
            6: {
              title: "S.1",
              icon: "oppose"
            }
          }
        },
        3: {
          orgTitle: "La Le Lu Le Lo",
          userLookup: "8P5Ar8NyAcNEVJMTexezXvRbept2",
          counter: "8",
          item: {
            1: {
              title: "S.128",
              icon: "endorse"
            },
            2: {
              title: "S.1000",
              icon: "neutral"
            },
            3: {
              title: "S.543",
              icon: "oppose"
            },
            4: {
              title: "S.767",
              icon: "endorse"
            },
            5: {
              title: "S.992",
              icon: "neutral"
            },
            6: {
              title: "S.1",
              icon: "oppose"
            },
            7: {
              title: "S.22",
              icon: "oppose"
            },
            8: {
              title: "S.393",
              icon: "neutral"
            }
          }
        }
      }
    }
  }
}
