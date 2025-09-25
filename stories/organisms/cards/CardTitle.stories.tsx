import { Meta, StoryObj } from "@storybook/react";
import { CardTitle } from "../../../components/Card";
import CardBootstrap from "react-bootstrap/Card";

const meta: Meta<typeof CardTitle> = {
  title: "Organisms/Cards/CardTitle",
  component: CardTitle,
};
export default meta;

type Story = StoryObj<typeof CardTitle>;

export const Primary: Story = {
  args: {
    title: "Header", 
  },
  render: ({ title }) => (
    <CardTitle>
      <CardBootstrap.Title className="align-items-start fs-6 lh-sm mb-1 text-secondary">
        <strong>{title}</strong>
      </CardBootstrap.Title>
    </CardTitle>
  ),
};
