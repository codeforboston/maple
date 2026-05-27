import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import * as admin from "firebase-admin"
import dotenv from "dotenv"
import { registerTools } from "./tools"

dotenv.config()

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID
  })
}

const server = new McpServer({
  name: "maple-mcp-server",
  version: "0.1.0"
})

// Register all tools
try {
  console.error("Registering tools...")
  registerTools(server)
  console.error("Tools registered successfully")
} catch (err) {
  console.error("Error registering tools:", err)
  process.exit(1)
}

// Connect via stdio transport (Claude Code will launch this as a subprocess)
const transport = new StdioServerTransport()

async function main() {
  try {
    console.error("Connecting server...")
    await server.connect(transport)
    console.error("Server connected successfully")
  } catch (err) {
    console.error("Error during server operation:", err)
    process.exit(1)
  }
}

// Log startup to stderr so it doesn't interfere with protocol
console.error("MAPLE MCP Server started on stdio")

main().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})

// Handle any uncaught errors
process.on("uncaughtException", err => {
  console.error("Uncaught exception:", err)
  process.exit(1)
})

process.on("unhandledRejection", err => {
  console.error("Unhandled rejection:", err)
  process.exit(1)
})

// Keep process alive
process.on("SIGINT", () => {
  console.error("Shutting down...")
  process.exit(0)
})




