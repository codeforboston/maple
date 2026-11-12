# Ask MAPLE agent

A chat agent that answers residents' questions about Massachusetts bills and the testimony on them. It runs as its own service. The site's `/chat` pages talk to it through the site's API routes.

```
browser ──Firebase ID token──▶ /api/copilotkit, /api/chat/*  (Next.js)
                                  │ verifies the token, sends the uid
                                  ▼
                               chat-agent (Express, this folder) ──in-process──▶ mcp-server/queries.ts ──▶ Firestore, Vertex AI
                                  │
                                  └─▶ Postgres: threads, checkpoints, memory, token usage
```

- **Agent:** LangChain v1 `createAgent` (a LangGraph ReAct loop) with Gemini. Middleware enforces a monthly token budget per user and a global cap, at most 6 tool calls per turn, history trimming, Stop, usage recording, and a memory of each finished turn.
- **Tools:** `search_bills`, `search_testimony` and `list_sponsors` run the MCP server's own queries (`mcp-server/queries.ts`) in-process, so there is no HTTP hop, agent key or MCP rate limit. `src/mcp.ts` maps their results to what the model and the chat cards read. `search_my_past_chats` searches the user's own earlier chats with pgvector.
- **Google Cloud access:** the service runs in the project that holds MAPLE's Firestore. Its service account reads Firestore and calls Vertex AI with Application Default Credentials. It can read the whole database, so every read goes through the shared queries, which mask private authors; `src/mcp.ts` also drops each testimony's `path`.
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

The bill, testimony and sponsor tools need the root `yarn install` (for `mcp-server/queries.ts`'s dependencies) and Google credentials that can read the dev Firestore: `gcloud auth application-default login`, once a maintainer has added you to `digital-testimony-dev`.

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
yarn --cwd chat-agent evals       # live: needs the service running, a real model and Firestore access
```

The site's chat tests are in `components/chat/*.test.ts(x)` and run with the root `yarn test`.

## Deploy

`deploy.sh <gcp-project>` builds the image from the repo root and deploys it to Cloud Run in that project, which must be the one holding MAPLE's Firestore (`digital-testimony-dev` or `-prod`). It needs three Secret Manager secrets, and grants the service account `roles/datastore.viewer` and `roles/aiplatform.user`; see the comment at the top of the script. Then set `CHAT_AGENT_URL` and `AGENT_SERVICE_TOKEN` in the Vercel project.
