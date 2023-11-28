import { Meta, Story } from "@storybook/react"

const meta: Meta = {
  title: "Atoms/Typography",
  component: () => null,
  parameters: {
    docs: {}
  }
}

export const Typopgraphy: Story = () => {
  return (
    <div className="d-inline-flex flex-column gap-4 justify-content-start align-items-start">
      <h1>h1. Maple is my favorite tree. </h1>
      <h2>h2. Maple is my favorite tree. </h2>
      <h3>h3. Maple is my favorite tree. </h3>
      <h4>h4. Maple is my favorite tree. </h4>
      <h5>h5. Maple is my favorite tree. </h5>
      <h6>h6. Maple is my favorite tree. </h6>
      <p>Body 1. Maple is my favorite tree.</p>
      <p>
        <small>Body 2. Maple is my favorite tree.</small>
      </p>
      <figcaption>Caption. Maple is my favorite tree. </figcaption>
      <button>Maple is my favorite tree.</button>
    </div>
  )
}

export default meta
