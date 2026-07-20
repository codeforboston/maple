import { createPage } from "../../components/page"
import { createGetStaticTranslationProps } from "components/translations"
import AiTools from "components/learn/AiTools/AiTools"

// Route and body are load-bearing: mcp-server/auth.ts and
// functions/src/mcp/proxy.ts send external MCP users to
// https://mapletestimony.org/learn/ai-tools for setup instructions.
export default createPage({
  titleI18nKey: "titles.ai_tools",
  Page: () => <AiTools />
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "learn",
  "aiTools"
])
