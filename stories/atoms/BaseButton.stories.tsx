import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { userEvent, within } from "@storybook/testing-library"
import { ReactNode } from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'


const BaseButton = styled(Button)``


const meta: Meta = {
  title: 'Atoms/BaseButton',
  component: BaseButton,
}
export default meta


type Story = StoryObj<typeof BaseButton>

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary'
  },
  name: 'Button',
}

export const HoveredButton: Story = {
  ...Primary,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole('button'))
  }
}

export const ClickedButton: Story = {
  ...Primary,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
  }
}
