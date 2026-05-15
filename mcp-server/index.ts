import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { registerTools } from "./tools";
import { hybridAuthMiddleware } from "./auth";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const server = new McpServer({
  name: "maple-mcp-server",
  version: "0.1.0",
});

// Register all RAG tools
registerTools(server);

const app = express();
app.use(express.json());

let transport: SSEServerTransport | null = null;

// SSE Endpoint - requires authentication
app.get("/sse", hybridAuthMiddleware, async (req, res) => {
  console.log("New SSE connection established");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

// Message Endpoint - handles incoming MCP messages
app.post("/message", async (req, res) => {
  if (!transport) {
    return res.status(400).json({ error: "No active SSE transport" });
  }
  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MAPLE MCP Server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});
