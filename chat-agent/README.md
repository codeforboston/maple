# Ask MAPLE agent

A chat agent that answers residents' questions about Massachusetts bills and the testimony on them. It runs as its own service. The site's `/chat` pages talk to it through the site's API routes.

```
browser ──Firebase ID token──▶ /api/copilotkit, /api/chat/*  (Next.js)
                                  │ verifies the token, sends the uid
                                  ▼
                               chat-agent (Express, this folder) ──agent key──▶ MCP server (bills, testimony, sponsors)
                                  │
                                  └─▶ Postgres: threads, checkpoints, memory, token usage
```

- **Agent:** LangChain v1 `createAgent` (a LangGraph ReAct loop) with Gemini. Middleware enforces a monthly token budget per user and a global cap, at most 6 tool calls per turn, history trimming, Stop, usage recording, and a memory of each finished turn.
- **Tools:** `search_bills`, `search_testimony` and `list_sponsors` call MAPLE's MCP server (`src/mcp.ts` maps its results to what the model and the chat cards read). `search_my_past_chats` searches the user's own earlier chats with pgvector.
- **Users:** the site verifies the Firebase ID token and sends the uid in `x-ask-maple-user`, together with the shared `AGENT_SERVICE_TOKEN`. The service scopes every thread, memory and budget to that uid, and answers 404 for anyone else's thread.
- **Streaming:** `POST /runs` streams AG-UI events. The site uses CopilotKit headless (no CopilotKit UI); all chat components are in `components/chat/`.

## Run locally

```bash
cd chat-agent
yarn install
cp .env.example .env   # fill it in
yarn setup-db          # once: chat tables and LangGraph checkpoint tables
yarn start             # http://127.0.0.1:2024
```

Then run the site with these server env vars, and open `/chat` signed in:

```
CHAT_AGENT_URL=http://127.0.0.1:2024
AGENT_SERVICE_TOKEN=<same value as chat-agent/.env>
COPILOTKIT_TELEMETRY_DISABLED=true
```

## Tests and evals

```bash
yarn --cwd chat-agent test        # fake model, PGlite; no network
yarn --cwd chat-agent check-types
yarn --cwd chat-agent evals       # live: needs the service running and a real model and MCP token
```

The site's chat tests are in `components/chat/*.test.ts(x)` and run with the root `yarn test`.

## Deploy

`deploy.sh <gcp-project>` builds the image and deploys it to Cloud Run. It needs `MAPLE_MCP_URL` set and four Secret Manager secrets; see the comment at the top of the script. Then set `CHAT_AGENT_URL` and `AGENT_SERVICE_TOKEN` in the Vercel project.
