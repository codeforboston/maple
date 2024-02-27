import useMergedRefs from "@restart/hooks/useMergedRefs"
import DropdownContext from "@restart/ui/DropdownContext"
import { useDropdownToggle } from "@restart/ui/DropdownToggle"
import classNames from "classnames"
import { CustomDropdownButton } from "components/buttons"
import * as React from "react"
import { useContext } from "react"
import Button, {
  ButtonProps,
  CommonButtonProps
} from "react-bootstrap/esm/Button"
import { BsPrefixRefForwardingComponent } from "react-bootstrap/esm/helpers"
import { useBootstrapPrefix } from "react-bootstrap/esm/ThemeProvider"
import useWrappedRefWithWarning from "react-bootstrap/esm/useWrappedRefWithWarning"

export interface DropdownToggleProps extends Omit<ButtonProps, "as"> {
  as?: React.ElementType
  split?: boolean
  childBsPrefix?: string
}

type DropdownToggleComponent = BsPrefixRefForwardingComponent<
  "button",
  DropdownToggleProps
>

export type PropsFromToggle = Partial<
  Pick<React.ComponentPropsWithRef<DropdownToggleComponent>, CommonButtonProps>
>

const CustomDropdownToggle = React.forwardRef(
  (
    {
      bsPrefix,
      split,
      className,
      childBsPrefix,
      // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
      as: Component = Button,
      ...props
    }: DropdownToggleProps & { label: string },
    ref
  ) => {
    // Set to undefined to prevent the default ::after chevron.
    // To reset: useBootstrapPrefix(bsPrefix, 'dropdown-toggle');
    const prefix = undefined

    const dropdownContext = useContext(DropdownContext)

    if (childBsPrefix !== undefined) {
      ;(props as any).bsPrefix = childBsPrefix
    }

    const [toggleProps] = useDropdownToggle()

    toggleProps.ref = useMergedRefs(
      toggleProps.ref,
      useWrappedRefWithWarning(ref, "CustomDropdownToggle")
    )

    // This intentionally forwards size and variant (if set) to the
    // underlying component, to allow it to render size and style variants.
    return (
      <CustomDropdownButton
        className={classNames(
          className,
          prefix,
          split && `${prefix}-split`,
          dropdownContext?.show && "show"
        )}
        {...toggleProps}
        {...props}
        // label={props.label}
        show={dropdownContext?.show}
      />
    )
  }
)

CustomDropdownToggle.displayName = "CustomDropdownToggle"

export default CustomDropdownToggle
