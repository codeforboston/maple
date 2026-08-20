/**
 * /dev/token — Firebase ID Token inspector
 *
 * Lets a signed-in user retrieve their current Firebase ID Token for local
 * MCP server testing. Not linked from any nav; visit directly.
 *
 * Usage:
 *   1. Sign in to the MAPLE dev site
 *   2. Navigate to /dev/token
 *   3. Click "Get Token" — token appears in the text area
 *   4. Click "Copy" and paste into your curl / MCP client
 */

import { useAuth } from "components/auth"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import React, { useState, useCallback } from "react"

function TokenPage() {
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [expiry, setExpiry] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = useCallback(async () => {
    if (!user) return
    setError(null)
    setCopied(false)
    try {
      const idToken = await user.getIdToken(/* forceRefresh */ true)
      setToken(idToken)

      // Decode the JWT payload (middle segment) to show expiry
      const payload = JSON.parse(atob(idToken.split(".")[1]))
      const expiryDate = new Date(payload.exp * 1000)
      setExpiry(expiryDate.toLocaleString())
    } catch (e) {
      setError(String(e))
    }
  }, [user])

  const copyToken = useCallback(async () => {
    if (!token) return
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [token])

  if (!user) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Firebase ID Token</h2>
        <p style={styles.warning}>
          ⚠️ You are not signed in. Please{" "}
          <a href="/login" style={styles.link}>
            sign in
          </a>{" "}
          first.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Firebase ID Token</h2>

      <p style={styles.meta}>
        Signed in as <strong>{user.email ?? user.uid}</strong>
      </p>

      <p style={styles.instructions}>
        Use this token to connect an MCP client (e.g. Claude Code) to the MAPLE
        MCP server. Paste it into your client config as shown below, then
        reconnect.
      </p>

      <h3 style={styles.subheading}>Claude Code / .mcp.json</h3>
      <pre style={styles.code}>
        {`{
  "mcpServers": {
    "maple": {
      "type": "http",
      "url": "https://mapletestimony.org/api/mcp",
      "headers": {
        "X-Maple-Token": "Bearer <paste-token-here>"
      }
    }
  }
}`}
      </pre>

      <div style={styles.buttonRow}>
        <button onClick={getToken} style={styles.button}>
          {token ? "↻ Refresh Token" : "Get Token"}
        </button>

        {token && (
          <button onClick={copyToken} style={styles.buttonCopy}>
            {copied ? "✓ Copied!" : "Copy to Clipboard"}
          </button>
        )}
      </div>

      {error && <p style={styles.error}>Error: {error}</p>}

      {token && (
        <>
          <textarea
            readOnly
            value={token}
            style={styles.textarea}
            onClick={e => (e.target as HTMLTextAreaElement).select()}
          />
          <p style={styles.expiry}>
            ⏱ Expires: <strong>{expiry}</strong>
          </p>
        </>
      )}

      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <strong>⏱ Tokens expire after 1 hour.</strong> Return here and click
          &ldquo;Refresh Token&rdquo; when yours expires, then update your
          client config with the new value.
        </p>
        <p style={styles.infoText}>
          <strong>🔑 Need a long-lived token?</strong> Organisations and
          persistent integrations can request an <em>agent key</em> — a
          non-expiring credential stored in Firestore — from the MAPLE team.
          Agent keys work in the same{" "}
          <code style={styles.inlineCode}>Authorization: Bearer</code> header
          and never need refreshing.
        </p>
      </div>

      <p style={styles.devNote}>
        🔒 Do not share your token. It grants access to the MAPLE MCP server on
        behalf of your account.
      </p>
    </div>
  )
}

export default createPage({
  Page: TokenPage
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer"
])

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 720,
    margin: "2rem auto",
    padding: "0 1rem",
    fontFamily: "sans-serif"
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: "0.5rem"
  },
  meta: {
    color: "#444",
    marginBottom: "0.5rem"
  },
  instructions: {
    marginBottom: "0.5rem"
  },
  code: {
    background: "#f4f4f4",
    border: "1px solid #ddd",
    borderRadius: 4,
    padding: "0.75rem 1rem",
    fontSize: "0.8rem",
    overflowX: "auto",
    marginBottom: "1rem",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all"
  },
  buttonRow: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem"
  },
  button: {
    padding: "0.5rem 1.25rem",
    background: "#1a56db",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "0.95rem"
  },
  buttonCopy: {
    padding: "0.5rem 1.25rem",
    background: "#047857",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "0.95rem"
  },
  textarea: {
    width: "100%",
    height: 140,
    fontFamily: "monospace",
    fontSize: "0.75rem",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: 4,
    resize: "vertical",
    background: "#fafafa",
    marginBottom: "0.5rem",
    boxSizing: "border-box"
  },
  expiry: {
    color: "#555",
    fontSize: "0.875rem",
    marginBottom: "1rem"
  },
  warning: {
    color: "#92400e",
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: 4,
    padding: "0.75rem 1rem"
  },
  link: {
    color: "#1a56db"
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 4,
    padding: "0.75rem 1rem"
  },
  devNote: {
    color: "#6b7280",
    fontSize: "0.8rem",
    marginTop: "0.5rem"
  },
  subheading: {
    fontSize: "1rem",
    marginBottom: "0.4rem",
    marginTop: "1rem"
  },
  infoBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 4,
    padding: "0.75rem 1rem",
    marginBottom: "1rem"
  },
  infoText: {
    margin: "0.4rem 0",
    fontSize: "0.875rem",
    color: "#1e3a5f"
  },
  inlineCode: {
    fontFamily: "monospace",
    background: "#dbeafe",
    padding: "0 3px",
    borderRadius: 2
  }
}
