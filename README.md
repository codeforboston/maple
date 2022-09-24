# Massachusetts Platform for Legislative Engagement (MAPLE)

A legislative testimony project through Code for Boston!

## Essentials

Join the [Code for Boston Slack](https://communityinviter.com/apps/cfb-public/default-badge) and our `#legislative-testimony` channel. Ask to join the Zenhub and Zeplin projects.

Attend a [weekly hack night at Code for Boston](https://www.meetup.com/code-for-boston/events/) and join our group.

You can find good first issues [here](https://github.com/codeforboston/advocacy-maps/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).

Check out the [Contributing](./Contributing.md) docs for how to contribute to the project.

## Contributors

Thanks to all our contributors!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This table follows the [All Contributors](https://allcontributors.org/) specification and is managed by the @all-contributors bot. You can add yourself or another contributor by [commenting on an issue or a pull request](https://allcontributors.org/docs/en/bot/usage).

## Links

- [Zenhub project board](https://app.zenhub.com/workspaces/design-and-development-629389aa02e9d200139c90b8/board), where issues are organized
- [Zeplin UI Mocks](https://app.zeplin.io/project/628d69a847f028bc7a5c15c9), where UI designs are organized
- [Development site](https://digital-testimony-dev.web.app), for testing and development. Feel free to play with the site!
- [Production site](https://mapletestimony.org), for public use and real testimony. Please only use this site to submit real testimony, not for testing.
- [Version 1](https://goodgovproject.com/) site, for posterity

## Getting Started

1. [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) a copy of the main repo to your GitHub account.

2. Clone your fork:

```
git clone https://github.com/YOUR_GITHUB_NAME/advocacy-maps.git
```

3. Add the main repo to your remotes:

```
cd advocacy-maps
git remote add upstream https://github.com/codeforboston/advocacy-maps.git
git fetch upstream
```

Now, whenever new code is merged you can pull in changes to your local repository:

```
git checkout master
git pull upstream master
```

4. Now you're ready to work on a feature! See the [Contributing](./Contributing.md) page for more info.

## Developing Locally

1. Make sure that you have `node` and `yarn` installed. You can download Node directly [here](https://nodejs.org/en/download/) or use a tool like [nvm](https://github.com/nvm-sh/nvm). To install yarn, run `npm i -g yarn` after installing node.
2. Install dependencies with `yarn install`.
3. If you are developing backend features, install Docker and [Docker Compose V2](https://docs.docker.com/compose/install/).

If you're developing frontend-only features, such as adding UI or hooks, you can start the development server with `yarn dev` and access the app at http://localhost:3000 in your browser. The site will automatically update as you make code changes. Your local site will share the same backend as the live development site.

If you're developing backend features, such as adding cloud functions or changing security rules, you can run the backend emulators, search server, and test data with `yarn dev:backend`. You can access the emulator UI at http://localhost:3010. The backend should update as you make code changes. When dependencies in `package.json` change, run `yarn dev:backend:update` to rebuild the image with the new dependencies. Finally, the first time you run the backend, or whenever you update, run `yarn dev:backfill` to generate new search indexes for bill/testimony search.

## Code Formatting and Linting

We use Prettier and ESLint to check files for consistent formatting and catch common programming errors. When you send out a PR, these run as part of the [`Repo Checks`](https://github.com/codeforboston/advocacy-maps/actions/workflows/repo-checks.yml) workflow.

You can install [pre-commit](https://pre-commit.com/) so that Prettier and ESLint run automatically when you commit. You can also run `yarn fix` locally to lint and format your code. You'll need to do one of these and commit the changes if the `Linting` and `Formatting` parts of the `Code Quality` check fails on your PR.

If you use VSCode, consider using our [project workspace file](https://github.com/codeforboston/advocacy-maps/blob/master/project.code-workspace) (open it in VSCode and click the "Open Workspace" button in the editor). It will ask you to install ESLint and Prettier extensions, which will show lint errors in your editor and set up Prettier as the default code formatter. You can format the current file from the [command pallete](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) by typing `Format Document`. You can also set the editor up to format on save: select `Open User Settings` from the command pallet, search for `format on save`, and enable it.

## Additional Documentation

- [Deployment Details](./Deployment.md)
- [Kubernetes Notes](./Kubernetes.md)
- [Search Design](./Search.md)
