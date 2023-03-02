declare module "*.handlebars" {
  const content: string
  export default content
}

declare module "handlebars/dist/handlebars" {
  export const compile: (s: string) => (s: string) => string
}
