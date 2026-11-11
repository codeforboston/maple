declare module "*.handlebars" {
  const content: string
  export default content
}

declare module "handlebars/dist/handlebars" {
  export const compile: (s: string) => (s: string) => string
  export const registerPartial: (s: string, x: string) => void
  export const registerHelper: typeof import("handlebars").registerHelper
}

// React 19 types removed the global JSX namespace; some dependencies still reference it.
declare namespace JSX {
  type ElementType = React.JSX.ElementType
  interface Element extends React.JSX.Element {}
  interface ElementClass extends React.JSX.ElementClass {}
  interface ElementAttributesProperty
    extends React.JSX.ElementAttributesProperty {}
  interface ElementChildrenAttribute
    extends React.JSX.ElementChildrenAttribute {}
  interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
  interface IntrinsicClassAttributes<T>
    extends React.JSX.IntrinsicClassAttributes<T> {}
  interface IntrinsicElements extends React.JSX.IntrinsicElements {}
}
