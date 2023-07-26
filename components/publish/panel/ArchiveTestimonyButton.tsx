import { ImageButton } from "components/buttons"
import { ImageProps } from "react-bootstrap"
import styled from "styled-components"
import clsx from "clsx"

export const ArchiveTestimonyButton = (props: ImageProps) => {
  return (
    <ImageButton
      alt="delete testimony"
      tooltip="Delete Testimony"
      src="/delete-testimony.svg"
      className={"testimony-button"}
      {...props}
    />
  )
}
