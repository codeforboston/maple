import { useRefinementList } from "react-instantsearch"

type VirtualRefinementWidgetProps = {
  attribute: string
}

const VirtualRefinementWidget = ({
  attribute
}: VirtualRefinementWidgetProps) => {
  useRefinementList({ attribute, limit: 500 })
  return null
}

export type VirtualRefinementsProps = {
  attributes: string[]
}

export const VirtualRefinements = ({ attributes }: VirtualRefinementsProps) => (
  <>
    {attributes.map(attribute => (
      <VirtualRefinementWidget key={attribute} attribute={attribute} />
    ))}
  </>
)
