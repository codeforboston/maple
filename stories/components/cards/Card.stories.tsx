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

const StorySVG = () => {
  return (
    <div>
      <img src="Thumbs Up.svg" alt="" />
    </div>
  )
}
const NewBody = () => {
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
  inHeaderElement: <StorySVG />
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

export const HeaderAndSubheaderAndTimestampAndImgAndNewBody = Template.bind({})
HeaderAndSubheaderAndTimestampAndImgAndNewBody.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM",
  body: <NewBody />
}

export const HeaderAndSubheaderAndTimestampAndImgAndBodyAndBodyImage =
  Template.bind({})
HeaderAndSubheaderAndTimestampAndImgAndBodyAndBodyImage.args = {
  header: "Header",
  subheader: "Subheader",
  timestamp: "3:29PM",
  imgSrc:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png",
  bodyText: "This is body text and it's nonsense placeholder and filler",
  bodyImage:
    "https://plus.unsplash.com/premium_photo-1661315458660-6aa08c1ddf38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bGVnaXNsYXRpb258ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
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

export const HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMoreAndItemElement =
  Template.bind({})
HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMoreAndItemElement.args = {
  header: "Header",
  subheader: "Subheader",
  bodyText: "This is body text and it's nonsense placeholder and filler",
  cardItems: [
    {
      billName: "H.3340",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts",
      element: <img src="edit-testimony.svg" />
    },
    {
      billName: "H.3342",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts",
      element: <img src="edit-testimony.svg" />
    },
    {
      billName: "H.3340",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts",
      element: <img src="edit-testimony.svg" />
    },
    {
      billName: "H.3342",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts",
      element: <img src="edit-testimony.svg" />
    },
    {
      billName: "H.3340",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts",
      element: <img src="edit-testimony.svg" />
    },
    {
      billName: "H.3342",
      billDescription:
        "An Act creating a green bank to promote clean energy in Massachusetts",
      element: <img src="edit-testimony.svg" />
    }
  ]
}
export const HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMoreAndItemElementAndBillNameElement =
  Template.bind({})
HeaderAndSubheaderAndBodyAndSixListItemsWithSeeMoreAndItemElementAndBillNameElement.args =
  {
    header: "Header",
    subheader: "Subheader",
    bodyText: "This is body text and it's nonsense placeholder and filler",
    cardItems: [
      {
        billName: "H.3340",
        billNameElement: <img src="Thumbs Up.svg" />,
        billDescription:
          "An Act creating a green bank to promote clean energy in Massachusetts",
        element: <img src="edit-testimony.svg" />
      },
      {
        billName: "H.3342",
        billNameElement: <img src="Thumbs Up.svg" />,
        billDescription:
          "An Act creating a green bank to promote clean energy in Massachusetts",
        element: <img src="edit-testimony.svg" />
      },
      {
        billName: "H.3340",
        billNameElement: <img src="Thumbs Up.svg" />,
        billDescription:
          "An Act creating a green bank to promote clean energy in Massachusetts",
        element: <img src="edit-testimony.svg" />
      },
      {
        billName: "H.3342",
        billNameElement: <img src="Thumbs Up.svg" />,
        billDescription:
          "An Act creating a green bank to promote clean energy in Massachusetts",
        element: <img src="edit-testimony.svg" />
      },
      {
        billName: "H.3340",
        billNameElement: <img src="Thumbs Up.svg" />,
        billDescription:
          "An Act creating a green bank to promote clean energy in Massachusetts",
        element: <img src="edit-testimony.svg" />
      },
      {
        billName: "H.3342",
        billNameElement: <img src="Thumbs Up.svg" />,
        billDescription:
          "An Act creating a green bank to promote clean energy in Massachusetts",
        element: <img src="edit-testimony.svg" />
      }
    ]
  }
