# Setup

```sh
# From the repo root
yarn install
cd analysis/downloader
yarn install
```

# Download Latest Bill Histories

```sh
cd analysis/downloader
yarn analyze downloadHistories
```

# Classify Actions

Edit the rules in `analysis/downloader/rules.ts` to update the classifier, and see the results in the `matched-actions.txt`, `overmatched-actions.txt`, and `unmatched-actions.txt` files.

```sh
cd analysis/download
yarn analyze classify --watch
```
