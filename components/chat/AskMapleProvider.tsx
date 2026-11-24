import {
  CopilotKitContext,
  CopilotKitCoreReact,
  EMPTY_SET
} from "@copilotkit/react-core/v2/context"
import { ReactNode, useMemo, useState } from "react"
import { authHeader } from "./chatFetch"

/**
 * CopilotKit without its UI. The v2 CopilotKitProvider entry imports CopilotKit's CSS at module
 * load, which breaks server rendering; the chat draws everything with MAPLE components anyway.
 */
export function AskMapleProvider({ children }: { children: ReactNode }) {
  const [copilotkit] = useState(
    () =>
      new CopilotKitCoreReact({
        runtimeUrl: "/api/copilotkit",
        credentials: "same-origin",
        // Evaluated per request, so a run always carries a fresh ID token.
        headers: authHeader
      })
  )
  const value = useMemo(
    () => ({
      copilotkit,
      showIntelligenceIndicator: false,
      executingToolCallIds: EMPTY_SET
    }),
    [copilotkit]
  )
  return (
    <CopilotKitContext.Provider value={value}>
      {children}
    </CopilotKitContext.Provider>
  )
}
