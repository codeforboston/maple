// Types for the CopilotKit subpath exports Ask MAPLE imports. The repo's moduleResolution "node"
// ignores package "exports" (switching to "bundler" breaks other packages' types); webpack resolves
// these imports normally at runtime.
declare module "@copilotkit/react-core/v2/headless" {
  export * from "@copilotkit/react-core/dist/v2/headless.mjs"
}
declare module "@copilotkit/react-core/v2/context" {
  export * from "@copilotkit/react-core/dist/v2/context.mjs"
}
declare module "@copilotkit/runtime/v2" {
  export * from "@copilotkit/runtime/dist/v2/index.mjs"
}
declare module "@copilotkit/runtime/v2/node" {
  export * from "@copilotkit/runtime/dist/v2/node.mjs"
}
