import "styled-components"

type Comp<P> = React.ComponentType<
  React.PropsWithChildren<P & { className?: string }>
>

declare module "styled-components" {
  // Extend the main styled function to make it generic wrt the component props,
  // not the entire component type.
  interface ThemedBaseStyledInterface<T extends object> {
    <P = {}>(component: Comp<P>): ThemedStyledFunction<Comp<P>, T>
  }
}
