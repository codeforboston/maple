# Working on MAPLE with an AI coding agent

This file is for two readers at once:

- **New contributors**, including people who are not professional developers, who want to use an AI coding agent (such as Claude Code) to propose changes to MAPLE.
- **The agent itself.** Agents that support `AGENTS.md` read it automatically. Everything here describes how the project already works; nothing here overrides [README.md](README.md), [Contributing.md](Contributing.md) or a maintainer's guidance.

If something here is out of date, fix it in the same PR as the change that made it wrong.

## Contents

1. [The project in one page](#the-project-in-one-page)
2. [Choosing where to run your agent](#choosing-where-to-run-your-agent)
3. [Guided onboarding: your first contribution](#guided-onboarding-your-first-contribution)
4. [How work is tracked: issues](#how-work-is-tracked-issues)
5. [How changes ship: branches, PRs, review and release](#how-changes-ship-branches-prs-review-and-release)
6. [Conventions by type of work](#conventions-by-type-of-work)
7. [Rules for agents](#rules-for-agents)
8. [Worked example: from a design mockup to production](#worked-example-from-a-design-mockup-to-production)
9. [Known gotchas](#known-gotchas)

## The project in one page

MAPLE (the Massachusetts Platform for Legislative Engagement) is a Code for Boston project at [mapletestimony.org](https://mapletestimony.org). Residents read bills and submit and read testimony to the Massachusetts legislature.

| Piece                     | Technology                                                        | Where it lives                                                                                       |
| ------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Website                   | Next.js (pages router), React, TypeScript                         | `pages/`, `components/`, `styles/`                                                                   |
| UI styling                | `styled-components` and `react-bootstrap` (most common), some MUI | `components/`                                                                                        |
| Translatable text         | `next-i18next`                                                    | `public/locales/en/<namespace>.json`                                                                 |
| Component library         | Storybook, published to Chromatic                                 | `stories/`                                                                                           |
| Database, auth, storage   | Firebase (Firestore, Auth, Storage)                               | `firestore.rules`, `firestore.indexes.json`, `storage.rules`                                         |
| Backend jobs and triggers | Firebase Cloud Functions (TypeScript)                             | `functions/src/`                                                                                     |
| Search                    | Typesense                                                         | `components/search/`, `docs/search-deployment.md`                                                    |
| Python services           | LLM features, data scrapers                                       | `llm/`, `lobbying-scraper/`                                                                          |
| Cloud infrastructure      | Google Cloud, Terraform                                           | `infra/`                                                                                             |
| Tests                     | Jest (unit/integration), Playwright (end-to-end)                  | `functions/`, `tests/integration/`, `tests/e2e/`, `*.test.ts` next to the code                       |
| Design notes and plans    | Markdown                                                          | `docs/` (feature write-ups and an ADR), plus the [wiki](https://github.com/codeforboston/maple/wiki) |

There are two Firebase projects: **`digital-testimony-dev`** (the development backend) and **`digital-testimony-prod`** (production). The website has three kinds of deployment, all on Vercel:

- **Preview:** a PR gets its own preview URL, linked from the PR.
- **Dev site:** [maple-dev.vercel.app](https://maple-dev.vercel.app/), rebuilt from `main`, using the dev backend. Safe to experiment on.
- **Production:** [mapletestimony.org](https://mapletestimony.org), rebuilt from the `prod` branch. Only real testimony goes here.

Features that are not yet public sit behind **feature flags** in [components/featureFlags.ts](components/featureFlags.ts). Each environment has its own defaults, and any flag can be switched on for one visit by adding it to the URL, for example `?lobbyingTable=enabled`.

## Choosing where to run your agent

You do not need a full local setup to contribute. Pick the column that matches the work.

|                                      | Cloud session (e.g. Claude Code on the web)                           | Local machine                                                                     |
| ------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Setup effort                         | Low: connect GitHub and pick the repository                           | Install Git, Node 22, Yarn 1, an editor and the agent                             |
| Good for                             | Text, translations, layout and styling, docs, small frontend features | Everything, including backend, data scripts and anything needing Google Cloud     |
| Running the site                     | `yarn install` then `yarn dev`, if the session's network allows it    | `yarn install` then `yarn dev`, open [localhost:3000](http://localhost:3000)      |
| Google Cloud / Firebase admin access | No. Do not paste credentials into a cloud session                     | Possible, once a maintainer adds you to the dev project (see [README](README.md)) |

### In a cloud session

1. Make sure you can push to a GitHub repository: either your own fork of `codeforboston/maple` (see [README → Getting Started](README.md#getting-started)) or a branch on the main repo if a maintainer has made you a collaborator.
2. Start a session on that repository. A fork's `main` is often far behind `codeforboston/maple`, and may not even contain this file, so have the agent start from the main repo's `main` first:

   ```bash
   git remote add upstream https://github.com/codeforboston/maple.git
   git fetch upstream main
   git checkout -B YOUR_BRANCH upstream/main
   # To try out someone's open PR instead: git fetch upstream pull/NNNN/head:pr-NNNN
   ```

3. Then paste this as your next message:

   > Read AGENTS.md, README.md and Contributing.md. Then explain in plain language what this project is, how a change gets to production, and what you can and cannot do in this environment.

4. The site needs **Node 22** (`package.json` → `engines`). `yarn install` refuses to run on older Node versions.
5. Check the setup with [Verify your setup](#verify-your-setup) before changing anything.
6. `yarn dev` serves the site against the **dev** Firebase backend; the public dev keys are checked in ([components/firebase.ts](components/firebase.ts)), so no secrets are needed. If pages load but data does not, the session's network settings may be blocking Google APIs. That is an environment limit, not a bug in your change; describe it in the PR and rely on the Vercel preview to check the page.
7. Cloud sessions may not have a running Docker daemon, so `yarn dev:up` and the emulator stack may not be available. Use `yarn dev` and `yarn test` instead, and leave backend changes that need the emulators to a local machine.

### On your own machine

Follow [README → Developing Locally](README.md#developing-locally). The short version:

```bash
git clone https://github.com/YOUR_GITHUB_NAME/maple.git
cd maple
git remote add upstream https://github.com/codeforboston/maple.git
yarn install
yarn dev          # website at http://localhost:3000, using the dev backend
yarn storybook    # component library at http://localhost:6006
```

Backend work runs the whole stack in Docker with `yarn dev:up` (emulator UI at [localhost:3010](http://localhost:3010)). Scripts that read or write the dev database need Google credentials, set up as described in [README → Contributing Backend Features](README.md#contributing-backend-features-to-devprod).

### Verify your setup

Run these on a fresh branch from `upstream/main`, before making changes, so you know what was already broken:

| Step                    | What a healthy result looks like                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn install`          | Finishes without errors. It can take several minutes on a fresh clone, and also installs `functions/` through `postinstall`, so there is no separate install for that. |
| `yarn check-types`      | No errors.                                                                                                                                                             |
| `yarn check-formatting` | "All matched files use Prettier code style!"                                                                                                                           |
| `yarn lint`             | Finishes, but prints existing warnings such as `i18next/no-literal-string`. Only warnings in files you changed are yours to fix.                                       |
| `yarn test`             | All Cloud Functions test suites pass.                                                                                                                                  |
| `yarn test:website`     | All website test suites pass.                                                                                                                                          |
| `yarn dev`              | `curl -I http://localhost:3000` returns `200`. The first request compiles the page and can take 20 seconds or more.                                                    |
| Python (only if needed) | `pip install -r llm/requirements.txt` (or `lobbying-scraper/requirements.txt`) first, then the Python checks [below](#checks-that-run-on-every-pr).                    |

If something fails on an untouched branch, it is not caused by your change. Note it in the PR rather than fixing it as part of unrelated work.

### Claude Code specifically

Recent versions of Claude Code read `AGENTS.md` automatically, but only when there is **no** `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in the project folder or above it. See [How Claude remembers your project](https://code.claude.com/docs/en/memory#agents-md).

- **No personal notes?** Nothing to do: Claude Code loads this file. In an interactive session you'll see a line like `no CLAUDE.md found; AGENTS.md loaded`.
- **Keeping personal notes?** `CLAUDE.md` is gitignored in this repo, so you can keep your own. Creating one stops Claude Code from reading `AGENTS.md` unless your `CLAUDE.md` imports it. Start your `CLAUDE.md` with this line:

  ```markdown
  @AGENTS.md
  ```

  The import also covers older Claude Code versions and sessions where reading `AGENTS.md` directly isn't available.

- **Check that it loaded.** Ask the agent to list the [rules for agents](#rules-for-agents) from memory. If it can't, this file wasn't loaded. The usual cause is a session started on a branch that doesn't have it yet, such as a stale fork `main`; see [In a cloud session](#in-a-cloud-session).

Put anything specific to your own machine (paths, environment managers, local ports) in your `CLAUDE.md`, never in committed files.

## Guided onboarding: your first contribution

This path assumes no prior experience with Git or React. Your agent can do the typing; your job is to decide what should change, check the result and talk to people.

1. **Say hello.** Join the [Code for Boston Slack](https://communityinviter.com/apps/cfb-public/default-badge) and the `#maple-testimony` channel. Share your GitHub username and ask to be added as a collaborator. Hack nights are listed on [Meetup](https://www.meetup.com/code-for-boston/events/).
2. **Pick something small.** Start from a [good first issue](https://github.com/codeforboston/maple/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22), or something you noticed on the [dev site](https://maple-dev.vercel.app/). Comment on the issue that you are working on it. If there is no issue yet, open one first (see [issues](#how-work-is-tracked-issues)).
3. **Set up your agent** using [the section above](#choosing-where-to-run-your-agent).
4. **Ask for a plan before any code.** For example:

   > I want to work on issue #NNNN (paste the link). Read the issue, find the files involved, and write a short plan: what you will change, how I can see the result, and anything you are unsure about. Don't change files yet.

   Read the plan. Ask the agent to explain anything you don't follow. If the plan touches the database, Cloud Functions, infrastructure or production, stop and ask a maintainer on Slack or in the issue first.

5. **Let the agent make the change on a new branch**, then look at it yourself: run `yarn dev` and open the page, or wait for the Vercel preview on your PR. Check it on a narrow (phone-sized) window too.
6. **Ask the agent to run the checks** that CI will run (see [checks](#checks-that-run-on-every-pr)) and fix what fails.
7. **Open a pull request** that fills in [the PR template](pull_request_template.md), links the issue with `closes #NNNN`, and includes screenshots. Ask the agent to draft the description and then edit it so it says what _you_ checked.
8. **Respond to review.** Reviewers may ask questions; it is fine to reply "I used an agent for this part, let me check". Paste review comments to your agent and ask it to address them, then push again.
9. **Merge** when [Contributing.md's merge checklist](Contributing.md) is satisfied. Your change then appears on the dev site, and goes to production with the next release.

## How work is tracked: issues

- Work is tracked as [GitHub issues](https://github.com/codeforboston/maple/issues). [Contributing.md](Contributing.md) also links a Zenhub board that organizes the same issues.
- New issues use one of the templates in [.github/ISSUE_TEMPLATE](.github/ISSUE_TEMPLATE): **Bug report**, **Feature Enhancement Suggestion**, **New Feature Suggestion**, and **Actionable Item Ticket** (a scoped ticket with work detail, current state, resources and labels).
- Labels in use include an area (`frontend`, `backend`, `data`, `design`, `scraper`, `i18n`, `Mobile/Responsive`, `documentation`, …), a type (`bug`, `enhancement`, `new-feature`, `tech debt`), and status or priority labels such as `good first issue`, `help wanted`, `needs scope`, `Ready for Development`, `Must Have` and `Nice To Have`.
- Before starting, comment on the issue or assign it to yourself so work isn't duplicated.
- For a large change, such as a redesign, split it into issues that can each ship on their own (see the [worked example](#worked-example-from-a-design-mockup-to-production)).

## How changes ship: branches, PRs, review and release

```
your branch ──PR──▶ main ──(automatic)──▶ dev site + dev backend
                       │
                       └──"Deploy to PROD" PR by a maintainer──▶ prod ──▶ mapletestimony.org + prod backend
```

1. **Branch from the latest `main`** of `codeforboston/maple`. With a fork, `origin` is your fork and `upstream` is the main repo, so update with `git pull upstream main`; pulling from `origin` gives you your fork's possibly stale copy.
2. **Open a PR into `codeforboston/main`** and fill in [pull_request_template.md](pull_request_template.md): Summary (with the issue number), Checklist, Screenshots, Known issues, and Steps to test. Keep it short and specific.
3. **Review.** Code owners in [.github/CODEOWNERS](.github/CODEOWNERS) are added automatically. Contributing.md asks for an owner approval and an approval from someone with context on the code.
4. **Merging to `main`** updates the dev site through Vercel. Merges that touch `functions/`, `firestore.rules`, `firestore.indexes.json`, `firebase.json` or `storage.rules` also deploy the dev Firebase backend ([deploy-backend-dev.yml](.github/workflows/deploy-backend-dev.yml)).
5. **Releases to production** are done by maintainers, who open and merge a PR from `main` into `prod` (titled like "Deploy to PROD 10/15"). That updates the production site and deploys Firestore rules and indexes, Cloud Functions and storage rules to the prod project ([deploy-prod.yml](.github/workflows/deploy-prod.yml)). Contributors don't need to do anything for this step.

### Checks that run on every PR

[Repo Checks](.github/workflows/repo-checks.yml) runs on every push and PR. Run the same commands before you push:

| Check                                      | Command                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Lint                                       | `yarn lint`                                                                                                |
| Formatting (all files, including Markdown) | `yarn check-formatting`; fix with `yarn fix`                                                               |
| Types                                      | `yarn check-types`                                                                                         |
| Cloud Functions tests                      | `yarn test`                                                                                                |
| Website tests                              | `yarn test:website`                                                                                        |
| Integration tests                          | `yarn test:integration-ci <files>` (needs Java for the emulators)                                          |
| Python in `llm/`                           | `ruff check llm/`, `ruff format --check llm/`, `pytest llm/` (after `pip install -r llm/requirements.txt`) |

CI runs only the website tests named in the `test:website` script and the integration test files listed in [repo-checks.yml](.github/workflows/repo-checks.yml). Add a new test to one of those lists, or it can fail on `main` unnoticed.

Chromatic builds Storybook for every PR, and Terraform checks run when `infra/gcp` changes. Optional: install [pre-commit](https://pre-commit.com/) to run Prettier and lint on each commit ([.pre-commit-config.yaml](.pre-commit-config.yaml)).

## Conventions by type of work

Follow the surrounding code. Before writing something new, look for an existing component, hook or helper that does it.

### Frontend

- **Pages** live in `pages/` and are wrapped with `createPage({ titleI18nKey, Page })` from [components/page.tsx](components/page.tsx).
- **Text shown to users** goes in `public/locales/en/<namespace>.json` and is read with `useTranslation("<namespace>")`. Each page loads its namespaces with `createGetStaticTranslationProps([...])` from [components/translations.tsx](components/translations.tsx). The PR checklist asks for translatable strings.
- **Data loading.** Small or per-user data is read in the browser through hooks in `components/db/`. For large, slow-changing lists, load the data in `getStaticProps` with a `revalidate` interval so the page is built on the server and refreshed periodically ([components/lobbying/listPageProps.ts](components/lobbying/listPageProps.ts) is an example). Props must be JSON-serializable: use `null`, never `undefined`.
- **New Firestore queries** that need an index must add it to `firestore.indexes.json`. Don't create indexes only in the Firebase console; later deploys remove them.
- **Responsive.** Check every page at phone width.
- **Shared components** get a Storybook story in `stories/`. Storybook blocks real Firebase calls; pass mock data as props (see [README → Storybook Firebase Guard](README.md#storybook-firebase-guard)).
- **Unreleased features** go behind a flag in [components/featureFlags.ts](components/featureFlags.ts), so they can merge to `main` before they're public.

### Design

- UI designs are kept in [Figma](<https://www.figma.com/file/oMNmgiqDGTMco2v54gOW3b/MAPLE-Soft-Launch-(Mar-2023)?t=N7wquH4vslGiB1tK-0>), and the component library is published in [Chromatic](https://www.chromatic.com/library?appId=634f3926f2a0d0f0195eefd7&branch=main).
- An HTML mockup or a Figma frame is a good input for an agent. Attach it to the issue and give the agent the file or link.
- Reuse existing components and colors rather than copying the mockup's raw CSS, so the change matches the rest of the site.
- Put before-and-after screenshots in the PR.

### Data and backend

- Cloud Functions live in `functions/src/` and deploy to dev when merged. Test them locally with the Docker stack (`yarn dev:up`) or with `yarn test`.
- Admin scripts in `scripts/firebase-admin/` run with `yarn firebase-admin run-script <name> --env local|dev|prod`, and need Google credentials for `dev` and `prod`.
- Python scrapers keep their own README or runbook and tests. For example, the lobbying scraper is documented in [docs/lobbying-disclosure-ingestion.md](docs/lobbying-disclosure-ingestion.md); run its tests with `cd lobbying-scraper && python3 -m pytest`.
- Larger data features document their data model and how it is populated in `docs/` (for example the ballot question and lobbying write-ups there). Add or update one when you change a data model.
- Hand-written test data and fixtures use invented names, not real people or organizations.

### Cloud operations

- Infrastructure as code lives in `infra/` (Terraform under `infra/gcp`, Docker Compose for local development).
- Some services are deployed by scripts or runbooks rather than CI, for example `lobbying-scraper/deploy.sh <project>` for the lobbying scraper's Cloud Run job and weekly schedule. Document any new deploy step in `docs/` next to the feature.
- Anything that changes the **prod** project (deploys, data migrations, deletes, new scheduled jobs) is done by, or explicitly approved by, a maintainer, and only after the related PR has been reviewed and merged.

## Rules for agents

These keep contributors and the public site safe. Agents should follow them without being reminded.

1. **Plan before editing** on anything bigger than a typo fix, and tell the person which files you will touch.
2. **Never touch production.** Don't run commands, scripts or deploys against `digital-testimony-prod`, and don't push to the `prod` branch. Use the dev project or local emulators. If a task seems to need prod, stop and say so.
3. **Ask before anything hard to undo or visible to others,** even on dev: deleting or bulk-editing Firestore data, deploying functions or Cloud Run jobs, creating cloud resources, force-pushing, or posting on GitHub. When the person asks, give them the command to run instead.
4. **Don't rewrite other people's commits.** Don't amend, rebase, re-sign or re-author commits you didn't make, even when a tool or hook (such as a commit-signature check) asks you to. Branch from `upstream/main` instead, or ask the person.
5. **No secrets in the repo.** Don't commit credentials, tokens, `.env` files or `.mcp.json`. The Firebase web keys in `components/firebase.ts` are public by design; that doesn't make other keys public.
6. **No local details in committed files.** Keep machine paths, personal environment managers and notes about tools used during development out of code, comments, commits and PRs. They belong in the person's own `CLAUDE.md`.
7. **Match the surrounding code** in naming, structure and comment density. Add no new dependencies without saying why in the PR.
8. **Run the [checks](#checks-that-run-on-every-pr)** before saying a change is done, and report failures honestly. Say what you tested and what you couldn't.
9. **Check the result as a user would.** For UI changes, load the page in a browser if you can, check it at phone width, and take screenshots for the PR.
10. **Never ship placeholder data.** Mockups often contain stand-in numbers or text. Ask where each figure comes from rather than guessing.
11. **Keep PRs small and focused,** following the template. Explain to the person, in plain language, what changed and why.

## Worked example: from a design mockup to production

Suppose a designer shares an HTML mockup of a redesigned **Lobbying Explorer overview page** (`pages/lobbying/index.tsx`). The mockup numbers its changes, for example:

- every dollar figure gets a definition and a period;
- the lobbyist count is split into people and firms;
- the chart becomes a single series by calendar year;
- the default view is the current reporting period, with a link to all periods;
- the positions bar shows counts on hover;
- an "Agencies" tab is added for which there is no data yet.

Its notes also say bracketed figures are placeholders.

A contributor who isn't a developer can take this to production like this:

1. **Open an issue** with the Feature Enhancement template. Attach the mockup, list its numbered changes, and tag a maintainer. Ask which changes are wanted now.
2. **Have the agent sort the changes by what they need.** For example:

   > Here is the mockup (attach it) and the current page, pages/lobbying/index.tsx. For each numbered change, say whether it is (a) wording or layout only, (b) uses data the page already loads, or (c) needs data we don't have yet. Name the files and the data source for each, and say where you aren't sure. Don't edit anything.

   Changes that only need wording, layout or existing data are frontend tasks. A change that needs new data, like the people-versus-firms split or a whole new Agencies section, means changing how the data is collected or summarized. That needs a maintainer with dev database access, and often a separate issue.

3. **Split the work** into issues or PRs that can ship on their own, for example "add definitions and periods to the overview stat cards" and "show position counts on hover". Small PRs are reviewed faster.
4. **Build one piece at a time.** Ask the agent to follow [the frontend conventions](#frontend): move new text into `public/locales/en/lobbying.json`, reuse existing components and the explorer's colors in `components/lobbying/chartTheme.tsx`, and work at phone width. If the new design should not be public yet, put it behind a feature flag.
5. **Look at it.** Run `yarn dev`, or use the PR's Vercel preview, and compare it side by side with the mockup. Fix anything that isn't what the designer intended, and remove every placeholder figure.
6. **Open the PR** with the template, `closes #NNNN`, before-and-after screenshots and steps to test. Ask the designer to look at the preview link.
7. **After merge**, check the change on [the dev site](https://maple-dev.vercel.app/lobbying). It reaches [mapletestimony.org](https://mapletestimony.org) with the next maintainer release from `main` to `prod`.

## Known gotchas

- **Use Node 22.** `yarn install` and `yarn fix` refuse to run on older Node because of `package.json` → `engines`.
- **Prettier formats Markdown too.** CI runs `prettier --check .`, so run `yarn fix` (or `npx prettier --write <file>`) after editing docs, this file included.
- **`gh pr create --body` and `gh pr edit` can silently drop the PR description** on this repo (a GitHub Projects (classic) deprecation error). Use the REST API instead:

  ```bash
  # Write the description to pr_body.md first, then:
  python3 -c "import json,sys; print(json.dumps({'title': sys.argv[1], 'head': sys.argv[2], 'base': 'main', 'body': open('pr_body.md').read()}))" \
    "Short title" "YOUR_GITHUB_NAME:your-branch" > pr.json
  gh api repos/codeforboston/maple/pulls --method POST --input pr.json

  # To replace the description of an existing PR:
  python3 -c "import json; print(json.dumps({'body': open('pr_body.md').read()}))" > pr.json
  gh api repos/codeforboston/maple/pulls/NUMBER --method PATCH --input pr.json
  ```

- **Fork remotes.** In a fork clone, `origin` is your fork. Pull from `upstream main` before branching, or your branch may start from an old `main`.
- **Page data must be JSON.** `getStaticProps` and `getServerSideProps` fail on `undefined` values; use `null`.
