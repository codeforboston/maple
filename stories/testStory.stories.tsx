import { ComponentStory, Meta, Story } from "@storybook/react"
import {
  Button,
  ButtonGroup,
  Col,
  ColProps,
  Container,
  Row,
  Stack
} from "react-bootstrap"
import { createMeta } from "./utils"
import { useState } from "react"

const themeColors = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
  "link"
]

type themeColorsType = (typeof themeColors)[number]

type TestProps = Partial<{
  buttonList: themeColorsType[]
  title: string
  activeColor: (typeof themeColors)[number]
  inactiveColor: (typeof themeColors)[number]
}>

const TestStory = ({
  buttonList,
  activeColor,
  inactiveColor,
  title
}: TestProps) => {
  const [active, setActive] = useState<string>()

  const [titleColor, setTitleColor] = useState<
    themeColorsType[number] | undefined
  >(buttonList?.[0])

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActive(event.currentTarget.innerText)
    setTitleColor(event.currentTarget.innerText)
  }

  return (
    <Container>
      <Col xs={4}>
        <Col
          as={"h1"}
          title={title}
          className={`btn-${titleColor} rounded-3 text-center py-3`}
        >
          {title}
        </Col>
        <Stack
          direction="horizontal"
          gap={3}
          className="py-5 rounded-3 col-12 bg-white justify-content-center flex-wrap"
        >
          {themeColors?.map((button, index) => (
            <Button
              size="lg"
              key={index}
              variant={active === button ? activeColor : `outline-${button}`}
              onClick={onClick}
              active={button === active}
            >
              {button}
            </Button>
          ))}
        </Stack>
      </Col>
    </Container>
  )
}

const meta: Meta = {
  title: "Test Story",
  component: TestStory,
  parameters: {
    docs: {}
  }
}

const Template: ComponentStory<typeof TestStory> = args => (
  <TestStory {...args} />
)

export const TestStoryBase = Template.bind({})

TestStoryBase.args = {
  buttonList: themeColors,
  title: "Test Story",
  activeColor: "warning",
  inactiveColor: "light"
}

export default meta
