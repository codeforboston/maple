# Digital Testimony Platform

Live Site (version 1): https://goodgovproject.com/

In-Development Site (version 2): https://digital-testimony-dev.web.app

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

## Deployment

The site runs on Firebase and is deployed using Github Actions. The site is deployed automatically whenever we push to the `master` branch. Deployments should "just work" but if the site isn't updating, check the status of the deployment action.

[Deployment Action](https://github.com/codeforboston/advocacy-maps/actions/workflows/firebase-hosting-merge.yml)

[Firebase console](https://console.firebase.google.com/u/0/project/digital-testimony-dev/)

## Development FAQ

### How do I create a new page?

Take a look at the `pages/browse.tsx` page:

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
