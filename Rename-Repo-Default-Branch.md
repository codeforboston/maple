On 10/22/22 around 4PM EDT, @alexjball renamed the repo from `advocacy-maps` to `maple` to reflect the current project, and renamed the default `master` branch to `main` ([rationale](https://github.com/github/renaming)).

Github now redirects the old repo name and default branch to the new ones, so things should continue to work, but you should perform the steps below to update your fork and local clone. These instructions assume `origin` points to your fork and `upstream` points to the codeforboston repo, as in the setup instructions. You can check by running `remote -vv`.

Git Documentation:

- [Renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)
- [Renaming master to main](https://github.com/github/renaming)
- [Renaming a branch](https://docs.github.com/github/administering-a-repository/renaming-a-branch)

1. Remove the existing `main` branch on your fork:

```sh
git push -d origin main
git branch -d main
```

2. In the settings for your repo (https://github.com/YOUR_USERNAME/advocacy-maps/settings), rename your repository to `maple`

3. In the branch settings for your repo (https://github.com/YOUR_USERNAME/advocacy-maps/settings/branches), rename your default branch to `main`

4. Update your local clone to use the new names:

```sh
# Use the new repo names in your remote urls
git remote set-url origin https://github.com/YOUR_USERNAME/maple.git
git remote set-url upstream https://github.com/codeforboston/maple.git

# Move off of master
git checkout -b renaming
# Rename your local master branch
git branch -m master main

# Connect your local main branch to your fork
git fetch origin
git branch -u origin/main main
git remote set-head origin -a

# Checkout your main branch
git checkout main
```

5. In the future, when you need to pull in code, you'll use `main` instead of `master`:

```sh
git checkout main
git pull upstream main
```
