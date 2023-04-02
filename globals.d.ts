declare module "*.handlebars" {
  const content: string
  export default content
}

declare module "handlebars/dist/handlebars" {
  export const compile: (s: string) => (s: string) => string
  export const registerPartial: (s: string, x: string) => void
  export const registerHelper: typeof import("handlebars").registerHelper
}
