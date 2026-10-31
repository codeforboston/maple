#!/usr/bin/env node
/*
 * Drafts (and optionally opens) the "Deploy to PROD" pull request from `main`
 * into `prod` on codeforboston/maple.
 *
 * Usage:
 *   yarn create-prod-release-pr            # dry run: prints the title and body
 *   yarn create-prod-release-pr --create   # opens the PR
 *
 * Requires the GitHub CLI (`gh`), authenticated. The script only reads PRs and
 * commits and, with --create, opens one PR. It never approves or merges.
 */
const { execFileSync } = require("child_process")

const REPO = "codeforboston/maple"
const BASE = "prod"
const HEAD = "main"

// Lines from pull_request_template.md that authors may leave in unedited.
const TEMPLATE_EXAMPLE_STEPS = [
  "**Before deploy:** Set the `FEATURE_API_KEY` secret using `vercel env add FEATURE_API_KEY`.",
  "**After deploy:** Run `yarn backfill:new-field --env dev` to populate the new field for existing records.",
  "**After deploy:** Enable the `newFeature` flag in the feature flag settings."
]

const gh = (...args) =>
  execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })

const ghJson = (...args) => JSON.parse(gh("api", ...args))

const unreleasedShas = () =>
  gh(
    "api",
    "--paginate",
    `repos/${REPO}/compare/${BASE}...${HEAD}`,
    "--jq",
    ".commits[].sha"
  )
    .split("\n")
    .filter(Boolean)

const commitInfo = sha => {
  const commit = ghJson(`repos/${REPO}/commits/${sha}`)
  const pulls = ghJson(`repos/${REPO}/commits/${sha}/pulls`).filter(
    p => p.base.ref === HEAD && p.merged_at
  )
  return { sha, message: commit.commit.message.split("\n")[0], pulls }
}

/** Returns the bullet items under an "Extra Deploy Steps" heading. */
const extractDeploySteps = body => {
  const lines = (body ?? "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\r/g, "")
    .split("\n")
  const start = lines.findIndex(l =>
    /^#{1,6}\s*extra deploy steps\s*$/i.test(l.trim())
  )
  if (start === -1) return []

  const section = []
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,6}\s/.test(line)) break
    section.push(line)
  }

  const items = []
  let sawBullet = false
  for (const line of section) {
    const bullet = line.match(
      /^\s{0,3}(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s*)?(.*)$/
    )
    if (bullet) {
      sawBullet = true
      items.push(bullet[1].trim())
    } else if (sawBullet && /^\s+\S/.test(line) && items.length) {
      items[items.length - 1] += " " + line.trim()
    }
  }

  // Fall back to plain paragraphs when the author didn't use bullets.
  const candidates = sawBullet
    ? items
    : section.map(l => l.trim()).filter(Boolean)

  return candidates.filter(
    item =>
      item &&
      !item.startsWith("_") &&
      !/^(none|n\/a|na|nothing|no)\.?$/i.test(item) &&
      !TEMPLATE_EXAMPLE_STEPS.includes(item)
  )
}

const buildBody = entries => {
  const prs = new Map()
  const loose = []
  for (const { sha, message, pulls } of entries) {
    if (pulls.length === 0) loose.push({ sha, message })
    for (const pr of pulls) prs.set(pr.number, pr)
  }
  const sorted = [...prs.values()].sort((a, b) => a.number - b.number)

  const changelog = [
    ...sorted.map(pr => `* #${pr.number} ${pr.title}`),
    ...loose.map(c => `* ${c.sha.slice(0, 7)} ${c.message} (no PR)`)
  ]

  const steps = sorted.flatMap(pr =>
    extractDeploySteps(pr.body).map(s => `- [ ] ${s} (#${pr.number})`)
  )

  return [
    "## Changelog",
    "",
    ...(changelog.length ? changelog : ["_No unreleased changes._"]),
    "",
    "## Extra Deploy Steps",
    "",
    ...(steps.length ? steps : ["_None._"]),
    ""
  ].join("\n")
}

const main = () => {
  const create = process.argv.includes("--create")
  const shas = unreleasedShas()
  if (shas.length === 0) {
    console.log(`${BASE} is up to date with ${HEAD}. Nothing to release.`)
    return
  }

  const now = new Date()
  const title = `Deploy to PROD ${now.getMonth() + 1}/${now.getDate()}/${String(
    now.getFullYear()
  ).slice(2)}`
  const body = buildBody(shas.map(commitInfo))

  console.log(`${title}\n\n${body}`)
  if (!create) {
    console.log("(dry run: pass --create to open the PR)")
    return
  }

  const existing = gh(
    "pr",
    "list",
    "--repo",
    REPO,
    "--base",
    BASE,
    "--head",
    HEAD,
    "--state",
    "open",
    "--json",
    "url",
    "--jq",
    ".[].url"
  ).trim()
  if (existing) {
    console.error(`An open ${HEAD} -> ${BASE} PR already exists: ${existing}`)
    process.exit(1)
  }

  // `gh pr create --body` can silently drop the body on this repo; use the API.
  const payload = JSON.stringify({ title, head: HEAD, base: BASE, body })
  const pr = JSON.parse(
    execFileSync(
      "gh",
      ["api", `repos/${REPO}/pulls`, "--method", "POST", "--input", "-"],
      { input: payload, encoding: "utf8" }
    )
  )
  console.log(`Opened ${pr.html_url}`)
}

main()
