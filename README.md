# Digital Testimony Platform

- Development site, for testing and development: https://digital-testimony-dev.web.app
- Production site, for public use and real testimony: https://digital-testimony-prod.web.app
- Version 1 site, for posterity: https://goodgovproject.com/

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

Use `git push` to upload your commits to your fork. When you're finished, [open a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to merge your branch into `codeforboston/master`

## Developing Locally

1. Make sure that you have `node` and `yarn` installed. You can download Node directly [here](https://nodejs.org/en/download/) or use a tool like [nvm](https://github.com/nvm-sh/nvm). To install yarn, run `npm i -g yarn` after installing node.
2. Install dependencies with `yarn install`
3. Start the development server with `yarn dev`
4. Open the app at http://localhost:3000 in your browser

## Code Formatting and Linting

We use Prettier and ESLint to check files for consistent formatting and catch common programming errors. When you send out a PR, these run as part of the [`Repo Checks`](https://github.com/codeforboston/advocacy-maps/actions/workflows/repo-checks.yml) workflow.

You can install [pre-commit](https://pre-commit.com/) so that Prettier and ESLint run automatically when you commit. You can also run `yarn fix` locally to lint and format your code. You'll need to do one of these and commit the changes if the `Linting` and `Formatting` parts of the `Code Quality` check fails on your PR.

If you use VSCode, consider using our [project workspace file](https://github.com/codeforboston/advocacy-maps/blob/master/project.code-workspace) (open it in VSCode and click the "Open Workspace" button in the editor). It will ask you to install ESLint and Prettier extensions, which will show lint errors in your editor and set up Prettier as the default code formatter. You can format the current file from the [command pallete](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) by typing `Format Document`. You can also set the editor up to format on save: select `Open User Settings` from the command pallet, search for `format on save`, and enable it.

## Deployment

The site runs on Firebase and is deployed using Github Actions. The dev site is deployed automatically whenever we push to the `master` branch. The prod site is deployed whenever we push to the `prod` branch, and on approval of @alexjball or @mvictor55. Deployments should "just work" but if the site isn't updating, check the status of the deployment action.

- Development Environment
  - [Frontend Deployment Workflow](https://github.com/codeforboston/advocacy-maps/actions/workflows/deploy-frontend-dev.yml)
  - [Backend Deployment Workflow](https://github.com/codeforboston/advocacy-maps/actions/workflows/deploy-backend-dev.yml)
  - [Console](https://console.firebase.google.com/u/0/project/digital-testimony-dev/)
- Production Environment
  - [Deployment Workflow](https://github.com/codeforboston/advocacy-maps/actions/workflows/deploy-prod.yml)
  - [Console](https://console.firebase.google.com/u/0/project/digital-testimony-prod/)

## Development FAQ

### How do I create a new page?

Take a look at the `pages/bills.tsx` page:

```typescript
export default createPage({
  v2: true,
  title: "Browse",
  Page: () => {
    return (
      <>
        <h1>Browse</h1>
        ...
      </>
    )
  }
})
```

Your page content goes in `Page`, and will be wrapped in a layout component. Setting `v2` to `true` will use the `V2Layout`, which will render the content inside a bootstrap `Container`. The page is rendered by `_app.tsx`.
