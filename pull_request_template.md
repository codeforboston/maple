# Summary

_Add a short summary of the changes, and a reference to the original issue using `#` and the issue number, like #1_

# Checklist

- [ ] On the frontend, I've made my strings translate-able.
- [ ] If I've added shared components, I've added a storybook story.
- [ ] I've made pages responsive and look good on mobile.
- [ ] If I've added new Firestore queries, I've added any new required indexes to `firestore.indexes.json` (Please do not only create indexes through the Firebase Web UI, even though the error messages may reccommend it - indexes created this way may be obliterated by subsequent deploys)

# Screenshots

_Add some screenshots highlighting your changes._

# Known issues

_If you've run against limitations or caveats, include them here. Include follow-up issues as well._

# Extra Deploy Steps

_List any steps beyond a standard merge and Vercel/Firebase deploy that are needed to deploy this PR, such as running backfill scripts, configuring third-party APIs, setting environment variables or secrets, configuring monitoring or alerts, or flipping flags. Use a bulleted list; for each step, specify the action (including exact CLI commands when needed) and whether it must happen **before** or **after** the standard Vercel/Firebase deploy._

_Example only:_

- **Before deploy:** Set the `FEATURE_API_KEY` secret using `vercel env add FEATURE_API_KEY`.
- **After deploy:** Run `yarn backfill:new-field --env dev` to populate the new field for existing records.
- **After deploy:** Enable the `newFeature` flag in the feature flag settings.

# Steps to test/reproduce

_For each feature or bug fix, create a step by step list for how a reviewer can test it out. E.g.:_

1. Go to the home page
1. Click on a testimony
1. See that it's loaded with a loading spinner
