declare module "*.handlebars" {
  const content: string
  export default content
}

declare module "handlebars/dist/handlebars" {
  type H = typeof import("handlebars")

  export const compile: H["compile"]
  export const registerPartial: H["registerPartial"]
  export const registerHelper: H["registerHelper"]
}
