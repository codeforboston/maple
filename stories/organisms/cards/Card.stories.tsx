import { Meta, StoryObj } from "@storybook/react"
import { Card } from "components/Card"

const meta: Meta = {
  title: "Organisms/Cards/Card",
  component: Card
}

export default meta

type Story = StoryObj<typeof Card>

const CustomBody = () => {
  var misfits = ["Danzig", "Only", "Doyle", "Googy"]
  return (
    <div>
      <img
        src="https://media.istockphoto.com/id/1333237768/photo/spooky-halloween-sky.jpg?b=1&s=170667a&w=0&k=20&c=g2iKCwBRqWDqRmPBpxDmdNSO8MMn9_xFJafafOid4DI="
        width="100%"
        alt="Spooky Halloween Sky"
      ></img>
      <p>
        {misfits.map(misfit => {
          return <span key={misfit}>{misfit} </span>
        })}
      </p>
    </div>
  )
}

export const HeaderAndSubheaderAndTimestamp: Story = {
  args: {
    header: "Header",
    subheader: "Subheader",
    timestamp: "3:29PM"
  }
}

export const HeaderAndSubheaderAndTimestampAndImgAndBody: Story = {
  args: {
    header: "Header",
    subheader: "Subheader",
    timestamp: "3:29PM",
    imgSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png",
    bodyText:
      "This is body text and it's nonsense placeholder and filler.  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  }
}
export const HeaderAndSubheaderAndTimestampAndImgAndCustomBody: Story = {
  args: {
    header: "Header",
    subheader: "Subheader",
    timestamp: "3:29PM",
    body: <CustomBody />
  }
}

export const HeaderAndSubheaderAndBodyAndTwoListItems: Story = {
  args: {
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
}
