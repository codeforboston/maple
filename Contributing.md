# Contributing

Everyone should feel empowered to contribute to the project as they can, whether through code contributions, reviews, testing and bug reporting, design, policy, or facilitating conversations. Contributors and reviewers are expected to follow the [Code for Boston code of conduct](https://www.codeforboston.org/code-of-conduct/), both in meetings and reviews. Reviews are opportunities to learn and improve our skills, and no one should be made to feel judged or unwelcome. Feel free to reach out to any of the Maple or Code for Boston leads with any concerns.

# Contributing a Code Change

We follow the [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow) or fork-and-pull development model.

1. Pick an issue. See issues organized on our [project board](https://app.zenhub.com/workspaces/design-and-development-629389aa02e9d200139c90b8/board). If you're new, [check out the Good First Issues in our product and sprint backlogs](https://app.zenhub.com/workspaces/design-and-development-629389aa02e9d200139c90b8/board?labels=good%20first%20issue). Once you choose an issue, assign it to yourself or leave a comment saying you're working on it.

2. Build your feature. First, open a feature branch off `main`:

```
git checkout main
git checkout -b MY_FEATURE
git push -u origin MY_FEATURE
```

Then use `git push` to upload your commits to your fork.

3. When you finish your feature, [open a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to merge your branch into `codeforboston/main`.

Be sure to [link the PR to the issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) either by adding "closes #123" to the description or manually adding it under the Development section on the sidebar. This will automatically close the issue when the PR is merged and help keep issues organized.

Add a reviewer to your PR. If you're not sure who has the context to review, add `alexjball`.

4. Watch for and respond to review comments. Once all the checks pass and someone approves your PR, you can merge it!

## Resolving Conflicts

If other PR's are merged while yours is in review, your changes may start to conflict with `main`. This will be displayed on the PR. You'll need to resolve merge conflicts before you can merge your PR:

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Merge main into your feature branch
git checkout MY_FEATURE
git merge main
```

[This will print out a message about a conflict](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/about-merge-conflicts). Resolve them (recommend [using VSCode](https://www.youtube.com/watch?v=QmKdodJU-js) or [command line](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line) rather than the GitHub web interface), stage the files, commit the changes, and finally push your changes to your feature branch.

# Development Conventions

## Creating a New Page

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
