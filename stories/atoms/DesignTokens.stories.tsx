import { Meta, StoryObj } from "@storybook/react"
import { useEffect, useState } from "react"
import styled from "styled-components"

/**
 * Every value here is read from the live custom properties with
 * `getComputedStyle`, never restated. That means this story cannot drift from
 * styles/bootstrap.scss, and it re-reads when a theme attribute changes, so it
 * shows whichever skin is currently applied.
 */

type SwatchKind =
  | "color"
  | "gradient"
  | "radius"
  | "shadow"
  | "space"
  | "chip"
  | "value"

type TokenGroup = {
  label: string
  note?: string
  kind: SwatchKind
  /** Full custom property names, or for "chip", the shared prefix of a bg/text/border triple. */
  tokens: string[]
}

const GROUPS: TokenGroup[] = [
  {
    label: "Brand",
    kind: "color",
    tokens: [
      "--maple-brand-primary",
      "--maple-brand-primary-strong",
      "--maple-brand-accent",
      "--maple-brand-danger",
      "--maple-brand-dark",
      "--maple-brand-senate",
      "--maple-brand-stage-past"
    ]
  },
  {
    label: "Text",
    kind: "color",
    tokens: [
      "--maple-text-strong",
      "--maple-text-body",
      "--maple-text-muted",
      "--maple-text-inverse",
      "--maple-text-inverse-muted"
    ]
  },
  {
    label: "Surfaces",
    note: "Several are translucent. The checkerboard shows through where they are.",
    kind: "color",
    tokens: [
      "--maple-surface-base",
      "--maple-surface-page",
      "--maple-surface-learn",
      "--maple-surface-muted",
      "--maple-surface-accent",
      "--maple-surface-accent-strong",
      "--maple-surface-border",
      "--maple-surface-hearing-search",
      "--maple-surface-hearing-header",
      "--maple-surface-transcript-stripe",
      "--maple-surface-transcript-hover",
      "--maple-learn-cyan"
    ]
  },
  {
    label: "Gradients",
    kind: "gradient",
    tokens: ["--maple-surface-gradient", "--maple-accent-gradient"]
  },
  {
    label: "Borders",
    kind: "color",
    tokens: [
      "--maple-border-default",
      "--maple-border-inverse-soft",
      "--maple-border-accent",
      "--maple-border-accent-strong"
    ]
  },
  {
    label: "Overlays",
    note: "Alpha layers meant to sit on top of something else.",
    kind: "color",
    tokens: [
      "--maple-overlay-inverse-subtle",
      "--maple-overlay-inverse-medium",
      "--maple-overlay-inverse-focus",
      "--maple-overlay-backdrop-subtle",
      "--maple-overlay-backdrop"
    ]
  },
  {
    label: "Focus",
    kind: "color",
    tokens: ["--maple-focus-ring", "--maple-focus-border"]
  },
  {
    label: "Semantic tints",
    note: "Reusable subtle palette. Each is a background, text and border triple.",
    kind: "chip",
    tokens: [
      "--maple-color-blue-subtle",
      "--maple-color-green-subtle",
      "--maple-color-red-subtle",
      "--maple-color-gray-subtle"
    ]
  },
  {
    label: "Ballot question statuses",
    note: "Aliases of the semantic tints above.",
    kind: "chip",
    tokens: [
      "--maple-status-expectedonballot",
      "--maple-status-accepted",
      "--maple-status-rejected",
      "--maple-status-failedtoappear"
    ]
  },
  {
    label: "Radius",
    kind: "radius",
    tokens: [
      "--maple-radius-sm",
      "--maple-radius-md",
      "--maple-radius-lg",
      "--maple-radius-xl",
      "--maple-radius-pill"
    ]
  },
  {
    label: "Shadow",
    kind: "shadow",
    tokens: ["--maple-shadow-sm", "--maple-shadow-md", "--maple-shadow-hover"]
  },
  {
    label: "Spacing",
    kind: "space",
    tokens: [
      "--maple-space-xs",
      "--maple-space-sm",
      "--maple-space-md",
      "--maple-space-lg",
      "--maple-space-xl",
      "--maple-space-2xl",
      "--maple-space-3xl"
    ]
  },
  {
    label: "Type",
    note: "Out of scope for the reskin, shown so the system is complete.",
    kind: "value",
    tokens: [
      "--maple-font-heading",
      "--maple-font-weight-normal",
      "--maple-font-weight-medium",
      "--maple-font-weight-semibold",
      "--maple-font-weight-bold",
      "--maple-line-height-tight",
      "--maple-line-height-base",
      "--maple-line-height-loose"
    ]
  },
  {
    label: "Motion and layout",
    kind: "value",
    tokens: [
      "--maple-transition-fast",
      "--maple-transition-base",
      "--maple-navbar-height"
    ]
  }
]

const CHIP_PARTS = ["bg", "text", "border"] as const

/** Flat list of every property this story reads, chip triples expanded. */
const ALL_TOKENS = GROUPS.flatMap(group =>
  group.kind === "chip"
    ? group.tokens.flatMap(base => CHIP_PARTS.map(part => `${base}-${part}`))
    : group.tokens
)

function useTokenValues(): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const read = () => {
      const computed = getComputedStyle(document.documentElement)
      setValues(
        Object.fromEntries(
          ALL_TOKENS.map(name => [
            name,
            computed.getPropertyValue(name).trim() || "not set"
          ])
        )
      )
    }

    read()

    // Re-read when a theme attribute flips, so the story follows the toggle.
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-maple-theme", "data-bs-theme", "class", "style"]
    })
    return () => observer.disconnect()
  }, [])

  return values
}

const Page = styled.div`
  color: var(--maple-text-body);
  font-size: 14px;
  padding: 24px;
`

const GroupHeading = styled.h2`
  border-bottom: 1px solid var(--maple-border-default);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 32px 0 4px;
  padding-bottom: 6px;
  text-transform: uppercase;
`

const GroupNote = styled.p`
  color: var(--maple-text-muted);
  font-size: 12px;
  margin: 0 0 12px;
`

const Rows = styled.div`
  display: grid;
  gap: 4px;
`

const Row = styled.div`
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: 96px 1fr 1fr;
  min-height: 44px;
`

const Name = styled.code`
  color: var(--maple-text-strong);
  font-size: 12px;
  word-break: break-all;
`

const Value = styled.code`
  color: var(--maple-text-muted);
  font-size: 12px;
  word-break: break-all;
`

/** Alpha tokens are only legible over something. */
const Checker = styled.div`
  background-color: #fff;
  background-image: linear-gradient(45deg, #d8d8d8 25%, transparent 25%),
    linear-gradient(-45deg, #d8d8d8 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d8d8d8 75%),
    linear-gradient(-45deg, transparent 75%, #d8d8d8 75%);
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
  background-size: 8px 8px;
  border: 1px solid var(--maple-border-default);
  height: 36px;
  width: 88px;
`

const Fill = styled.div`
  height: 100%;
  width: 100%;
`

const ShadowField = styled.div`
  align-items: center;
  background: #f0f0f0;
  display: flex;
  height: 44px;
  justify-content: center;
  width: 88px;
`

const Chip = styled.span`
  border-radius: 999px;
  border-style: solid;
  border-width: 1px;
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 12px;
  text-transform: uppercase;
`

function Swatch({ kind, token }: { kind: SwatchKind; token: string }) {
  switch (kind) {
    case "color":
      return (
        <Checker>
          <Fill style={{ background: `var(${token})` }} />
        </Checker>
      )
    case "gradient":
      return (
        <Checker>
          <Fill style={{ background: `var(${token})` }} />
        </Checker>
      )
    case "radius":
      return (
        <div
          style={{
            background: "var(--maple-brand-primary)",
            borderRadius: `var(${token})`,
            height: 36,
            width: 88
          }}
        />
      )
    case "shadow":
      return (
        <ShadowField>
          <div
            style={{
              background: "var(--maple-surface-base)",
              boxShadow: `var(${token})`,
              height: 28,
              width: 64
            }}
          />
        </ShadowField>
      )
    case "space":
      return (
        <div style={{ width: 88 }}>
          <div
            style={{
              background: "var(--maple-brand-accent)",
              height: 12,
              width: `var(${token})`
            }}
          />
        </div>
      )
    default:
      return <div style={{ width: 88 }} />
  }
}

function TokenRows({
  group,
  values
}: {
  group: TokenGroup
  values: Record<string, string>
}) {
  if (group.kind === "chip") {
    return (
      <Rows>
        {group.tokens.map(base => (
          <Row key={base}>
            <Chip
              style={{
                background: `var(${base}-bg)`,
                borderColor: `var(${base}-border)`,
                color: `var(${base}-text)`
              }}
            >
              {base.replace(/^--maple-(color|status)-/, "").replace(/-/g, " ")}
            </Chip>
            <Name>{base}-*</Name>
            <Value>
              {CHIP_PARTS.map(part => values[`${base}-${part}`]).join("  ")}
            </Value>
          </Row>
        ))}
      </Rows>
    )
  }

  return (
    <Rows>
      {group.tokens.map(token => (
        <Row key={token}>
          <Swatch kind={group.kind} token={token} />
          <Name>{token}</Name>
          <Value>{values[token]}</Value>
        </Row>
      ))}
    </Rows>
  )
}

function DesignTokens() {
  const values = useTokenValues()

  return (
    <Page>
      {GROUPS.map(group => (
        <section key={group.label}>
          <GroupHeading>{group.label}</GroupHeading>
          {group.note && <GroupNote>{group.note}</GroupNote>}
          <TokenRows group={group} values={values} />
        </section>
      ))}
    </Page>
  )
}

const meta: Meta<typeof DesignTokens> = {
  title: "Atoms/Design Tokens",
  component: DesignTokens,
  parameters: {
    backgrounds: { default: "light" }
  }
}

export default meta

export const AllTokens: StoryObj<typeof DesignTokens> = {
  name: "Design Tokens"
}
