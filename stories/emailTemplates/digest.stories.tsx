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
    notificationFrequency: "weekly",
    startDate: "2/1/2023",
    endDate: "2/7/2023",
    Bill1: {
      Title: "H.1289",
      Subtitle:
        "An Act to protect the civil rights and safety of all Massachusetts residents",
      Testimonies: "12",
      Cosponsors: "2",
      HearingDate: "Jan 31"
    },
    Bill2: {
      Title: "H.98",
      Subtitle: "An Act to further govt. transparency",
      Testimonies: "2",
      Cosponsors: "0",
      HearingDate: "-"
    },
    Org1: {
      Title: "Boston’s Teacher Union",
      Counter: "3",
      Item1: {
        Title: "S.77",
        Icon: "endorse"
      },
      Item2: "S.1022",
      Item3: "S.64"
    },
    Org2: {
      Title: "Moms for Liberty",
      Counter: "6",
      Item1: "S.128",
      Item2: "S.1000",
      Item3: "S.543",
      Item4: "S.767",
      Item5: "S.992",
      Item6: "S.1"
    },
    Org3: {
      Title: "La Le Lu Le Lo",
      Counter: "8",
      Item1: "S.128",
      Item2: "S.1000",
      Item3: "S.543",
      Item4: "S.767",
      Item5: "S.992",
      Item6: "S.1",
      Item7: "S.22",
      Item8: "S.393"
    }
  }
}
