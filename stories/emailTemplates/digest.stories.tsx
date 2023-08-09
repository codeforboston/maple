import { ComponentStory } from "@storybook/react"
import digestEmail from "functions/src/email/digestEmail.handlebars"
import example1 from "functions/src/email/example1.handlebars"
import example2 from "functions/src/email/example2.handlebars"
import { createMeta } from "stories/utils"
import { EmailTemplateRenderer } from "./email-template-renderer"

export default createMeta({
  title: "Email Templates/Digest",
  figmaUrl:
    "https://www.figma.com/file/oMNmgiqDGTMco2v54gOW3b/MAPLE-Soft-Launch-(Mar-2023)?version-id=3065669916&node-id=3475%3A12449&t=Ol8nO044tWeUGHvP-4",
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
})

const Template: ComponentStory<typeof EmailTemplateRenderer> = args => (
  <EmailTemplateRenderer {...args} />
)

export const Example1 = Template.bind({})
Example1.args = {
  templateSrcUrl: example1,
  context: {
    name: "Derek",
    street: "123 Main St",
    city: "Pittsburgh",
    state: "PA"
  }
}

export const Example2 = Template.bind({})
Example2.args = {
  templateSrcUrl: example2,
  context: {
    name: "Yogi Berra",
    quotes: [
      {
        quote:
          "If you don't know where you are going, you might wind up someplace else."
      },
      {
        quote:
          "You better cut the pizza in four pieces because I'm not hungry enough to eat six."
      },
      { quote: "I never said most of the things I said." },
      { quote: "Nobody goes there anymore because it's too crowded." }
    ],
    yogiBio:
      '<i>Lawrence Peter "Yogi" Berra (May 12, 1925 - September 22, 2015) was an American professional baseball catcher, manager, and coach who played 19 seasons in Major League Baseball (MLB) (1946 - 63, 1965), all but the last for the New York Yankees. An 18-time All-Star and 10-time World Series champion as a player, Berra had a career batting average of .285, while compiling 358 home runs and 1,430 runs batted in.</i>',
    url: "http://yogiberramuseum.org/",
    text: "Yogi Berra Museum"
  }
}

export const DigestEmail = Template.bind({})
DigestEmail.args = {
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
        orgId: "Tfh1tp2faYbSWsYYsvUS4F23mtD2",
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
        orgId: "c31R5rjWG9eTUopP7yeA5tZQtJX2",
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
        orgId: "8P5Ar8NyAcNEVJMTexezXvRbept2",
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
