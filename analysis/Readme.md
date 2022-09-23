# Setup

The notebooks are developed to be used within VSCode. Set up a python environment for this project using [pyenv](https://github.com/pyenv/pyenv) or another environment manager.

After installing pyenv, set up an environment and configure it to be used by default in the project:

```sh
# From the repo root
pyenv install 3.10.5
pyenv virtualenv 3.10.5 maple-3.10.5
pyenv activate maple-3.10.5
echo "maple-3.10.5" > .python-version
pip install -r analysis/requirements.txt
```

To set up the downloader (optional):

```sh
# From the repo root
yarn install
cd analysis/downloader
yarn install
```

# TODO

- Display the first and last X number of actions for each bill.
- Order bill ID in numerical order rather than alphabetical order.

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
