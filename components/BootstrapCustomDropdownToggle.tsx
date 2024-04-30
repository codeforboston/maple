import DropdownContext from "@restart/ui/DropdownContext"
import { useDropdownToggle } from "@restart/ui/DropdownToggle"
import {
  CustomDropdownButton,
  CustomDropdownButtonProps
} from "components/buttons"
import * as React from "react"
import { useContext } from "react"
import { ButtonProps } from "react-bootstrap"

export interface DropdownToggleProps extends Omit<ButtonProps, "as"> {
  as?: React.ElementType
  split?: boolean
  childBsPrefix?: string
}
const CustomDropdownToggle = React.forwardRef<
  HTMLElement | null,
  CustomDropdownButtonProps & DropdownToggleProps
>(
  (
    {
      bsPrefix,
      className,
      // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
      as: Button,
      ...props
    },
    ref
  ) => {
    const dropdownContext = useContext(DropdownContext)

    const [toggleProps] = useDropdownToggle()

    // maually coercing the ref type to get it to pass as (ref: htmlelement | null) => void works but feels sketchy
    toggleProps.ref = ref => {}

    return (
      <CustomDropdownButton
        // Intentionally not using the class "dropdown-toggle" to prevent the ::after chevron.
        className={`${className} ${dropdownContext?.show && "show"}`}
        {...toggleProps}
        {...props}
        show={dropdownContext?.show}
      />
    )
  }
)

CustomDropdownToggle.displayName = "CustomDropdownToggle"

export default CustomDropdownToggle
