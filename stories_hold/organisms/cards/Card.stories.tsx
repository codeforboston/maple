import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { string } from "yargs"
import { Card } from "../../../components/Card"

export default createMeta({
  title: "Components/Cards/Card",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=229%3A8338",
  component: Card
})

const CustomBody = () => {
  var misfits = ["Danzig", "Only", "Doyle", "Googy"]
  return (
    <div>
      <img
        src="https://media.istockphoto.com/id/1333237768/photo/spooky-halloween-sky.jpg?b=1&s=170667a&w=0&k=20&c=g2iKCwBRqWDqRmPBpxDmdNSO8MMn9_xFJafafOid4DI="
        width="100%"
      ></img>
      <p>
        {misfits.map(misfit => {
          return <span key={misfit}>{misfit} </span>
        })}
      </p>
    </div>
  )
}

const Template: ComponentStory<typeof Card> = ({
  header,
  subheader,
  bodyText,
  timestamp,
  imgSrc,
  cardItems,
  inHeaderElement,
  body,
  ...rest
}) => {
  return (
    <Card
      header={header}
      subheader={subheader}
      bodyText={bodyText}
      timestamp={timestamp}
      imgSrc={imgSrc}
      cardItems={cardItems}
      inHeaderElement={inHeaderElement}
      body={body}
      {...rest}
    />
  )
}

export const Primary = Template.bind({})
Primary.args = {
  header: "Header"
}

export const HeaderAndSubheader = Template.bind({})
HeaderAndSubheader.args = {
  header: "Header",
  subheader: "Subheader"
}

export const HeaderAndSubheaderAndTimestamp = Template.bind({})
HeaderAndSubheaderAndTimestamp.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM"
}
export const HeaderAndSubheaderAndTimestampAndInHeaderElement = Template.bind(
  {}
)
HeaderAndSubheaderAndTimestampAndInHeaderElement.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM",
  inHeaderElement: <>button here</>
}

export const HeaderAndSubheaderAndTimestampAndImg = Template.bind({})
HeaderAndSubheaderAndTimestampAndImg.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM",
  imgSrc:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png"
}

export const HeaderAndSubheaderAndTimestampAndImgAndInHeaderElement =
  Template.bind({})
HeaderAndSubheaderAndTimestampAndImgAndInHeaderElement.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM",
  imgSrc:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png",
  inHeaderElement: <img src="/thumbs-endorse.svg" alt="" />
}

export const HeaderAndSubheaderAndTimestampAndImgAndBody = Template.bind({})
HeaderAndSubheaderAndTimestampAndImgAndBody.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM",
  imgSrc:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png",
  bodyText: "This is body text and it's nonsense placeholder and filler"
}

export const HeaderAndSubheaderAndTimestampAndImgAndCustomBody = Template.bind(
  {}
)
HeaderAndSubheaderAndTimestampAndImgAndCustomBody.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM",
  body: <CustomBody />
}

export const HeaderAndSubheaderAndBodyAndTwoListItems = Template.bind({})
HeaderAndSubheaderAndBodyAndTwoListItems.args = {
  header: "Header",
  subheader: "Subheader",
  bodyText: "This is body text and it's nonsense placeholder and filler",
  cardItems: [
    {
      billName: "H.3340",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    },
    {
      billName: "H.3342",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    }
  ]
}

export const HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMore =
  Template.bind({})
HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMore.args = {
  header: "Header",
  subheader: "Subheader",
  bodyText: "This is body text and it's nonsense placeholder and filler",
  cardItems: [
    {
      billName: "H.3340",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    },
    {
      billName: "H.3342",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    },
    {
      billName: "H.3340",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    },
    {
      billName: "H.3342",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    },
    {
      billName: "H.3340",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    },
    {
      billName: "H.3342",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts"
    }
  ]
}

export const HeaderWithItemsAndItemElements = Template.bind({})
HeaderWithItemsAndItemElements.args = {
  ...HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMore.args,
  cardItems:
    HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMore.args.cardItems?.map(
      item => {
        return { ...item, element: <img src="/edit-testimony.svg" /> }
      }
    )
}

export const HeaderWithItemsAndItemElementsAndBillNameElement = Template.bind(
  {}
)
HeaderWithItemsAndItemElementsAndBillNameElement.args = {
  ...HeaderWithItemsAndItemElements.args,
  cardItems: HeaderWithItemsAndItemElements.args.cardItems?.map(item => {
    return { ...item, billNameElement: <img src="/thumbs-endorse.svg" /> }
  })
}
