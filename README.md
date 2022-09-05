# Massachusetts Platform for Legislative Engagement (MAPLE)

A legislative testimony project through Code for Boston!

## Essentials

Join the [Code for Boston Slack](https://communityinviter.com/apps/cfb-public/default-badge) and our `#legislative-testimony` channel. Ask to join the Zenhub and Zeplin projects.

Attend a [weekly hack night at Code for Boston](https://www.meetup.com/code-for-boston/events/) and join our group.

You can find good first issues [here](https://github.com/codeforboston/advocacy-maps/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).

## Links

- [Zenhub project board](https://app.zenhub.com/workspaces/design-and-development-629389aa02e9d200139c90b8/board), where issues are organized
- [Zeplin UI Mocks](https://app.zeplin.io/project/628d69a847f028bc7a5c15c9), where UI designs are organized
- [Development site](https://digital-testimony-dev.web.app), for testing and development. Feel free to play with the site!
- [Production site](https://digital-testimony-prod.web.app), for public use and real testimony. Please only use this site to submit real testimony, not for testing.
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

4. To contribute a feature, open a feature branch off `master`:

```
git checkout master
git checkout -b MY_FEATURE
git push -u origin MY_FEATURE
```

Use `git push` to upload your commits to your fork. When you're finished, [open a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to merge your branch into `codeforboston/master`.

If other PR's are merged while yours is in review, your changes may start to conflict with `master`. This will be displayed on the PR. You'll need to resolve merge conflicts before you can merge your PR:

```bash
# Update your local master branch
git checkout master
git pull upstream master

# Merge master into your feature branch
git checkout MY_FEATURE
git merge master
```

[This will print out a message about a conflict](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/about-merge-conflicts). Resolve them (recommend [using VSCode](https://www.youtube.com/watch?v=QmKdodJU-js) or [command line](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line) rather than the Github web interface), stage the files, commit the changes, and finally push your changes to your feature branch.

## Contributing

See issues organized on our [project board](https://app.zenhub.com/workspaces/design-and-development-629389aa02e9d200139c90b8/board). If you're new, [check out the Good First Issues in our product and sprint backlogs](https://app.zenhub.com/workspaces/design-and-development-629389aa02e9d200139c90b8/board?labels=good%20first%20issue). Once you choose an issue, assign it to yourself or leave a comment saying you're working on it.

When you send out a PR that addresses an issue, [link the PR to the issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) either by adding "closes #123" to the description or manually adding it under the Development section on the sidebar. This will automatically close the issue when the PR is merged and help keep issues organized.

Add a reviewer to your PR. If you're not sure who has the context to review, add `alexjball`. Once all the checks pass and someone approves your PR, you can merge it!

## Developing Locally

1. Make sure that you have `node` and `yarn` installed. You can download Node directly [here](https://nodejs.org/en/download/) or use a tool like [nvm](https://github.com/nvm-sh/nvm). To install yarn, run `npm i -g yarn` after installing node.
2. Install dependencies with `yarn install`.
3. If you are developing backend features, install Docker and [Docker Compose V2](https://docs.docker.com/compose/install/).

If you're developing frontend-only features, such as adding UI or hooks, you can start the development server with `yarn dev` and access the app at http://localhost:3000 in your browser. The site will automatically update as you make code changes. Your local site will share the same backend as the live development site.

If you're developing backend features, such as adding cloud functions or changing security rules, you can run the backend emulators, search server, and test data with `yarn dev:backend`. You can access the emulator UI at http://localhost:3010. The backend should update as you make code changes.

## Code Formatting and Linting

We use Prettier and ESLint to check files for consistent formatting and catch common programming errors. When you send out a PR, these run as part of the [`Repo Checks`](https://github.com/codeforboston/advocacy-maps/actions/workflows/repo-checks.yml) workflow.

You can install [pre-commit](https://pre-commit.com/) so that Prettier and ESLint run automatically when you commit. You can also run `yarn fix` locally to lint and format your code. You'll need to do one of these and commit the changes if the `Linting` and `Formatting` parts of the `Code Quality` check fails on your PR.

If you use VSCode, consider using our [project workspace file](https://github.com/codeforboston/advocacy-maps/blob/master/project.code-workspace) (open it in VSCode and click the "Open Workspace" button in the editor). It will ask you to install ESLint and Prettier extensions, which will show lint errors in your editor and set up Prettier as the default code formatter. You can format the current file from the [command pallete](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) by typing `Format Document`. You can also set the editor up to format on save: select `Open User Settings` from the command pallet, search for `format on save`, and enable it.

## Additional Documentation

- [Deployment Details](./Deployment.md)
- [Kubernetes Notes](./Kubernetes.md)
- [Search Design](./Search.md)

## Development FAQ

### How do I create a new page?

Take a look at the `pages/bills.tsx` page:

```typescript
export default createPage({
  title: "Browse",
  Page: () => {
    return (
      <Container>
        <h1>Browse</h1>
        ...
      </Container>
    )
  }
})
```

Your page content goes in `Page`, and will be wrapped in a layout component. The page is rendered by `_app.tsx`.
