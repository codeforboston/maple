import { Meta, StoryFn, StoryObj } from "@storybook/react"

const meta: Meta = {
  title: "Atoms/Typography",
  component: () => null,
  parameters: {
    docs: {}
  }
}

export const Typopgraphy: StoryObj = {
  render: () => (
    <div className="d-inline-flex flex-column gap-4 justify-content-start align-items-start">
      <h1>h1. Maple is my favorite tree. </h1>
      <div className="fs-1">fs1. Maple is my favorite tree.</div>
      <h2>h2. Maple is my favorite tree. </h2>
      <div className="fs-2">fs2. Maple is my favorite tree.</div>
      <h3>h3. Maple is my favorite tree. </h3>
      <div className="fs-3">fs3. Maple is my favorite tree.</div>
      <h4>h4. Maple is my favorite tree. </h4>
      <div className="fs-4">fs4. Maple is my favorite tree.</div>
      <h5>h5. Maple is my favorite tree. </h5>
      <div className="fs-5">fs5. Maple is my favorite tree.</div>
      <h6>h6. Maple is my favorite tree. </h6>
      <div className="fs-6">fs6. Maple is my favorite tree.</div>
      <p>Body 1. Maple is my favorite tree.</p>
      <small>Body 2. Maple is my favorite tree.</small>
      <figcaption>Caption. Maple is my favorite tree. </figcaption>
      <button>Maple is my favorite tree.</button>
    </div>
  ),
  name: "Typography"
}

export default meta
