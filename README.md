# Massachusetts Platform for Legislative Engagement (MAPLE)

A legislative testimony project through Code for Boston!

We are creating a new web platform called MAPLE (the Massachusetts Platform for Legislative Engagement) that makes it easy for residents to submit their testimony to the MA legislature and read the testimony of others. Our goals are to shine a light on the statehouse by 1) providing a public archive of legislative testimony; 2) standardizing and demystifying the testimony process, so that more people can make their voices heard; and 3) creating a space for constituents and legislators to maintain prolonged focus on key issues, and to learn more efficiently about the laws that will shape our lives. Through this, we hope that people can better channel their political energy into productive improvements for our local and state communities.

## Essentials

Join the [Code for Boston Slack](https://communityinviter.com/apps/cfb-public/default-badge) and our `#maple-testimony` channel. Ask to join the Zenhub project and to be added as a collaborator on Github, and provide your Github username.

Attend a [weekly hack night at Code for Boston](https://www.meetup.com/code-for-boston/events/) and join our group.

You can find good first issues [here](https://github.com/codeforboston/maple/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).

Check out the [Contributing](./Contributing.md) docs for how to contribute to the project, and [the wiki](https://github.com/codeforboston/maple/wiki) for project documentation.

## Links

- [Zenhub project board](https://app.zenhub.com/workspaces/design-and-development-629389aa02e9d200139c90b8/board), where issues are organized
- [Figma Designs](<https://www.figma.com/file/oMNmgiqDGTMco2v54gOW3b/MAPLE-Soft-Launch-(Mar-2023)?t=N7wquH4vslGiB1tK-0>), where UI designs are organized
- [Chromatic Storybook Library](https://www.chromatic.com/library?appId=634f3926f2a0d0f0195eefd7&branch=main), where our React UI component library is documented.
- [Maple Documentation on the Wiki](https://github.com/codeforboston/maple/wiki)
- [Docker Desktop Client](https://www.docker.com/products/docker-desktop/), for running the full application locally

## Live Sites

- [Development site](https://maple-dev.vercel.app/), for testing and development. Feel free to play with the site!
- [Production site](https://mapletestimony.org), for public use and real testimony. Please only use this site to submit real testimony, not for testing.

## Getting Started

1. [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) a copy of the main repo to your GitHub account.

2. Clone your fork:

```
git clone https://github.com/YOUR_GITHUB_NAME/maple.git
```

3. Add the main repo to your remotes:

```
cd maple
git remote add upstream https://github.com/codeforboston/maple.git
git fetch upstream
```

Now, whenever new code is merged you can pull in changes to your local repository:

```
git checkout main
git pull upstream main
```

4. Now you're ready to work on a feature! See the [Contributing](./Contributing.md) page for more info, and refer to [the wiki](https://github.com/codeforboston/maple/wiki) for more documentation.

## Developing Locally

1. Make sure that you have `node` and `yarn` installed. You can download Node directly [here](https://nodejs.org/en/download/) or use a tool like [nvm](https://github.com/nvm-sh/nvm). To install yarn, run `npm i -g yarn` after installing node.
2. Install dependencies with `yarn install`.
3. If you are developing backend features involving firebase or typesense, install Docker and [Docker Compose V2](https://docs.docker.com/compose/install/).
4. Run a command and start developing:

- `yarn dev`: Start the Next.js development server. Use this if you're working on frontend features. View the app in your browser at [localhost:3000](http://localhost:3000). Make some changes to `components/` and `pages/`. The site will automatically update. Your local site will share the same backend as the live development site.
- `yarn storybook`: Start the Storybook development server. Use this if you're working on UI components. View your storybook at [localhost:6006](http://localhost:6006). It will update as you make changes to the stories in `stories/`.
- `yarn dev:up`: Run the full application locally using Docker Compose. Use this if you're working on full-stack or backend features in `functions/`. You can access the emulator UI at http://localhost:3010.
- `yarn dev:up:detach`: Run the application, and keep it running once you stop this command.
- `yarn dev:down`: Stop the application.
- `yarn dev:update`: Update the application images. Run this whenever dependencies in `package.json` change.

Install the [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) and [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) browser extensions if you're developing frontend

## Contributing Backend Features to Dev/Prod:

- If you are developing backend features involving only Next.js API routes and need to deploy them to the Dev site, you will need to login through Google Cloud Auth:

1. Ensure you are added as an editor of the Firebase project (https://console.firebase.google.com/u/0/project/digital-testimony-dev for development)

2. Download and initialize gcloud : https://cloud.google.com/sdk/docs/install

3. Authenticate with Google Cloud by running: `gcloud auth application-default login --no-launch-browser`. This will generate an application credentials file using your Google account.

4. At this point, you should also have an environment variable `GOOGLE_APPLICATION_CREDENTIALS` set to the path to that generated config file. If you have it, your setup is complete. If not, you will need to configure it by:

- Try running the `gcloud auth application-default login --no-launch-browser` again (for some reason, the environment variable will sometimes not be created on the first login)
- If that doesn't work, you will need to manually set the environment variable. In your `.bashrc`/`.zshrc`, add the line: `export GOOGLE_APPLICATION_CREDENTIALS=path/to/application_default_credentials.json` (with the correct file path)
- The needed file path is documented here, depending on your operating system: https://cloud.google.com/docs/authentication/application-default-credentials#:~:text=User%20credentials%20provided%20by%20using%20the%20gcloud%20CLI,-You%20can%20provide&text=The%20location%20depends%20on%20your,APPDATA%25%5Cgcloud%5Capplication_default_credentials.json
- Once that is set, you should be able to run the dev site from any new command line window/tab.

The main development/production site uses a Google Service Account to authenticate - there is a very low limit on the number of service accounts we can have, so we reserve those for official deployments. The method documented above simulates a service account using your personal Google account as a base to get around this limitation. If needed, the real Service Accounts can be found in the Firebase console: https://console.firebase.google.com/u/0/project/digital-testimony-dev/settings/serviceaccounts/adminsdk)

## Testing

MAPLE uses Jest for unit and integration testing, and Playwright for e2e testing.

Environment Setup for Testing.

To set up your environment for testing, make sure you have a .env file configured with the necessary variables. You can create it by copying the provided .env.example template:

```
cp .env.example .env
```

This file includes placeholders for key environment variables, which you should customize as needed:

```
TEST_ADMIN_USERNAME: Username for admin testing.
TEST_ADMIN_PASSWORD: Password for admin testing.
APP_API_URL: The base URL for the application API (default is http://localhost:3000).
```

Running Tests.

Once your environment is set up, you can start running tests with one of the following commands:

- `yarn test:integration [--watch] [-t testNamePattern] [my/feature.test.ts]`: Run integration tests in `components/` and `tests/integration/`. These tests run against the full local application -- start it with `yarn up`. You can use `--watch` to rerun your tests as you change them and filter by test name and file.
- `yarn test:e2e`: Run e2e tests in `tests/e2e` with the Playwright UI
- `yarn test:e2e:headless`: Run e2e tests in `tests/e2e` headless (no UI)

For more information on our end-to-end testing, go to our [e2e test README](tests/e2e/README.md). For an introduction on how to write e2e tests with Playwright, go to the [Playwright docs](https://playwright.dev/docs/writing-tests). An example of an e2e test can be found in [tests/e2e/homepage.spec.ts](tests/e2e/homepage.spec.ts).

## Code Formatting and Linting

We use Prettier and ESLint to check files for consistent formatting and catch common programming errors. When you send out a PR, these run as part of the [`Repo Checks`](https://github.com/codeforboston/maple/actions/workflows/repo-checks.yml) workflow.

You can install [pre-commit](https://pre-commit.com/) so that Prettier and ESLint run automatically when you commit. You can also run `yarn fix` locally to lint and format your code. You'll need to do one of these and commit the changes if the `Linting` and `Formatting` parts of the `Code Quality` check fails on your PR.

If you use VSCode, consider using our [project workspace file](https://github.com/codeforboston/maple/blob/main/project.code-workspace) (open it in VSCode and click the "Open Workspace" button in the editor). It will ask you to install ESLint and Prettier extensions, which will show lint errors in your editor and set up Prettier as the default code formatter. You can format the current file from the [command pallete](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) by typing `Format Document`. You can also set the editor up to format on save: select `Open User Settings` from the command pallet, search for `format on save`, and enable it.

## Additional Documentation

See [the Wiki](https://github.com/codeforboston/maple/wiki)

## Contributors

Thanks to all our contributors!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/0lafe"><img src="https://avatars.githubusercontent.com/u/21280852?v=4?s=100" width="100px;" alt="0lafe"/><br /><sub><b>0lafe</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=0lafe" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aaerhart"><img src="https://avatars.githubusercontent.com/u/45613289?v=4?s=100" width="100px;" alt="Aaron"/><br /><sub><b>Aaron</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=aaerhart" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alexjball"><img src="https://avatars.githubusercontent.com/u/8595776?v=4?s=100" width="100px;" alt="Alex Ball"/><br /><sub><b>Alex Ball</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=alexjball" title="Code">💻</a> <a href="https://github.com/codeforboston/maple/pulls?q=is%3Apr+reviewed-by%3Aalexjball" title="Reviewed Pull Requests">👀</a> <a href="#mentoring-alexjball" title="Mentoring">🧑‍🏫</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.careergpt.io"><img src="https://avatars.githubusercontent.com/u/58377006?v=4?s=100" width="100px;" alt="Allan Zheng "/><br /><sub><b>Allan Zheng </b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=azheng1991" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AnnaKSteele"><img src="https://avatars.githubusercontent.com/u/6483197?v=4?s=100" width="100px;" alt="Anna Steele"/><br /><sub><b>Anna Steele</b></sub></a><br /><a href="#business-AnnaKSteele" title="Business development">💼</a> <a href="#projectManagement-AnnaKSteele" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Tcoding12"><img src="https://avatars.githubusercontent.com/u/78769953?v=4?s=100" width="100px;" alt="Anthony "/><br /><sub><b>Anthony </b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=Tcoding12" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://asialakay.net"><img src="https://avatars.githubusercontent.com/u/66960776?v=4?s=100" width="100px;" alt="Asia K"/><br /><sub><b>Asia K</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=asiakay" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/austinhouck"><img src="https://avatars.githubusercontent.com/u/59891647?v=4?s=100" width="100px;" alt="Austin Houck"/><br /><sub><b>Austin Houck</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=austinhouck" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://chiroptical.dev"><img src="https://avatars.githubusercontent.com/u/3086255?v=4?s=100" width="100px;" alt="Barry Moore"/><br /><sub><b>Barry Moore</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=chiroptical" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://boazsender.com"><img src="https://avatars.githubusercontent.com/u/122117?v=4?s=100" width="100px;" alt="Boaz"/><br /><sub><b>Boaz</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=boazsender" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hanboyu"><img src="https://avatars.githubusercontent.com/u/39149005?v=4?s=100" width="100px;" alt="Boyu Han"/><br /><sub><b>Boyu Han</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=hanboyu" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bhrutledge.com/"><img src="https://avatars.githubusercontent.com/u/1326704?v=4?s=100" width="100px;" alt="Brian Rutledge"/><br /><sub><b>Brian Rutledge</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=bhrutledge" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bhinebaugh"><img src="https://avatars.githubusercontent.com/u/466561?v=4?s=100" width="100px;" alt="Byron Kent Hinebaugh"/><br /><sub><b>Byron Kent Hinebaugh</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=bhinebaugh" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/seatuna"><img src="https://avatars.githubusercontent.com/u/16471076?v=4?s=100" width="100px;" alt="Celena T."/><br /><sub><b>Celena T.</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=seatuna" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/cbmacd1213"><img src="https://avatars.githubusercontent.com/u/67985403?v=4?s=100" width="100px;" alt="Colin MacDonald"/><br /><sub><b>Colin MacDonald</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=cbmacd1213" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/almaraz333"><img src="https://avatars.githubusercontent.com/u/60356596?v=4?s=100" width="100px;" alt="Colton Almaraz"/><br /><sub><b>Colton Almaraz</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=almaraz333" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JabaDUDE"><img src="https://avatars.githubusercontent.com/u/94672626?v=4?s=100" width="100px;" alt="Dakota"/><br /><sub><b>Dakota</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=JabaDUDE" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dherbst"><img src="https://avatars.githubusercontent.com/u/136589?v=4?s=100" width="100px;" alt="Darrel Herbst"/><br /><sub><b>Darrel Herbst</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=dherbst" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Dev1nxavier"><img src="https://avatars.githubusercontent.com/u/7763861?v=4?s=100" width="100px;" alt="Dev1nxavier"/><br /><sub><b>Dev1nxavier</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=Dev1nxavier" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gerlinp"><img src="https://avatars.githubusercontent.com/u/68314210?v=4?s=100" width="100px;" alt="Gerlin"/><br /><sub><b>Gerlin</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=gerlinp" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.grace-zhang.com/"><img src="https://avatars.githubusercontent.com/u/67801289?v=4?s=100" width="100px;" alt="Grace Zhang"/><br /><sub><b>Grace Zhang</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=gracezhang89" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/HuanFengYeh"><img src="https://avatars.githubusercontent.com/u/87419751?v=4?s=100" width="100px;" alt="Huanfeng"/><br /><sub><b>Huanfeng</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=HuanFengYeh" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bandism.net/"><img src="https://avatars.githubusercontent.com/u/22633385?v=4?s=100" width="100px;" alt="Ikko Eltociear Ashimine"/><br /><sub><b>Ikko Eltociear Ashimine</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=eltociear" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://jicruz.com"><img src="https://avatars.githubusercontent.com/u/58642383?v=4?s=100" width="100px;" alt="J.I. Cruz"/><br /><sub><b>J.I. Cruz</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=jicruz96" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jkoren"><img src="https://avatars.githubusercontent.com/u/67333843?v=4?s=100" width="100px;" alt="Jeff Korenstein"/><br /><sub><b>Jeff Korenstein</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=jkoren" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KY233466"><img src="https://avatars.githubusercontent.com/u/81402259?v=4?s=100" width="100px;" alt="KY233466"/><br /><sub><b>KY233466</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=KY233466" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://kepweb.dev/"><img src="https://avatars.githubusercontent.com/u/19396186?v=4?s=100" width="100px;" alt="Kep Kaeppeler"/><br /><sub><b>Kep Kaeppeler</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=Keparoo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://kimin-kim.pages.dev/"><img src="https://avatars.githubusercontent.com/u/55262612?v=4?s=100" width="100px;" alt="Kimin Kim"/><br /><sub><b>Kimin Kim</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=kiminkim724" title="Code">💻</a> <a href="https://github.com/codeforboston/maple/pulls?q=is%3Apr+reviewed-by%3Akiminkim724" title="Reviewed Pull Requests">👀</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/poon-kittipong"><img src="https://avatars.githubusercontent.com/u/56698287?v=4?s=100" width="100px;" alt="Kittipong Deevee"/><br /><sub><b>Kittipong Deevee</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=poon-kittipong" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/LauraUmana"><img src="https://avatars.githubusercontent.com/u/11620537?v=4?s=100" width="100px;" alt="Laura Umana"/><br /><sub><b>Laura Umana</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=LauraUmana" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pololeningcelaya"><img src="https://avatars.githubusercontent.com/u/57147656?v=4?s=100" width="100px;" alt="Leopoldo Lening Celaya"/><br /><sub><b>Leopoldo Lening Celaya</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=pololeningcelaya" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/luke-rucker"><img src="https://avatars.githubusercontent.com/u/10203352?v=4?s=100" width="100px;" alt="Luke Rucker"/><br /><sub><b>Luke Rucker</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=luke-rucker" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/NONstiky"><img src="https://avatars.githubusercontent.com/u/16812993?v=4?s=100" width="100px;" alt="Marcos Banchik"/><br /><sub><b>Marcos Banchik</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=NONstiky" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mtrepaniercajigas.vercel.app/"><img src="https://avatars.githubusercontent.com/u/88287632?v=4?s=100" width="100px;" alt="Mark Trepanier-Cajigas"/><br /><sub><b>Mark Trepanier-Cajigas</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=MarkTrepanier" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.zagaja.com/"><img src="https://avatars.githubusercontent.com/u/565647?v=4?s=100" width="100px;" alt="Matthew Zagaja"/><br /><sub><b>Matthew Zagaja</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=mzagaja" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Mephistic"><img src="https://avatars.githubusercontent.com/u/2694761?v=4?s=100" width="100px;" alt="Mephistic"/><br /><sub><b>Mephistic</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=Mephistic" title="Code">💻</a> <a href="https://github.com/codeforboston/maple/pulls?q=is%3Apr+reviewed-by%3AMephistic" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mikeyavorsky"><img src="https://avatars.githubusercontent.com/u/1855512?v=4?s=100" width="100px;" alt="Mike Yavorsky"/><br /><sub><b>Mike Yavorsky</b></sub></a><br /><a href="#design-mikeyavorsky" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kilometers"><img src="https://avatars.githubusercontent.com/u/6674848?v=4?s=100" width="100px;" alt="Miles Baird"/><br /><sub><b>Miles Baird</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=kilometers" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://minqichai.notion.site/"><img src="https://avatars.githubusercontent.com/u/44985426?v=4?s=100" width="100px;" alt="Minqi Chai"/><br /><sub><b>Minqi Chai</b></sub></a><br /><a href="#userTesting-mchai1218" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nesanders"><img src="https://avatars.githubusercontent.com/u/1727426?v=4?s=100" width="100px;" alt="Nathan Sanders"/><br /><sub><b>Nathan Sanders</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=nesanders" title="Code">💻</a> <a href="#business-nesanders" title="Business development">💼</a> <a href="#fundingFinding-nesanders" title="Funding Finding">🔍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://navdeep.xyz"><img src="https://avatars.githubusercontent.com/u/80774259?v=4?s=100" width="100px;" alt="Navdeep"/><br /><sub><b>Navdeep</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=navdeep1840" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://olivertarrherman.com/"><img src="https://avatars.githubusercontent.com/u/6138460?v=4?s=100" width="100px;" alt="Oliver Herman"/><br /><sub><b>Oliver Herman</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=oneeyedego" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/peterschiller"><img src="https://avatars.githubusercontent.com/u/57169063?v=4?s=100" width="100px;" alt="Peter Schiller"/><br /><sub><b>Peter Schiller</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=peterschiller" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.richardkwon.com/"><img src="https://avatars.githubusercontent.com/u/24848125?v=4?s=100" width="100px;" alt="Richard Kwon"/><br /><sub><b>Richard Kwon</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=Rae-Kwon" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://rdhss.netlify.app/"><img src="https://avatars.githubusercontent.com/u/91738561?v=4?s=100" width="100px;" alt="Ridho Suhendar"/><br /><sub><b>Ridho Suhendar</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=rdhss" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rileyhgrant"><img src="https://avatars.githubusercontent.com/u/59549713?v=4?s=100" width="100px;" alt="Riley Grant"/><br /><sub><b>Riley Grant</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=rileyhgrant" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RobertMrowiec"><img src="https://avatars.githubusercontent.com/u/25043084?v=4?s=100" width="100px;" alt="RobertMrowiec"/><br /><sub><b>RobertMrowiec</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=RobertMrowiec" title="Code">💻</a> <a href="https://github.com/codeforboston/maple/pulls?q=is%3Apr+reviewed-by%3ARobertMrowiec" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://rodrigopassos.com/"><img src="https://avatars.githubusercontent.com/u/994788?v=4?s=100" width="100px;" alt="Rodrigo Passos"/><br /><sub><b>Rodrigo Passos</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=webrgp" title="Code">💻</a> <a href="https://github.com/codeforboston/maple/pulls?q=is%3Apr+reviewed-by%3Awebrgp" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://samuelbuhan.com"><img src="https://avatars.githubusercontent.com/u/47086819?v=4?s=100" width="100px;" alt="Samuel BUHAN"/><br /><sub><b>Samuel BUHAN</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=SamuelBuhan" title="Code">💻</a> <a href="#userTesting-SamuelBuhan" title="User Testing">📓</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ssolmonson"><img src="https://avatars.githubusercontent.com/u/58236786?v=4?s=100" width="100px;" alt="Scott Solmonson"/><br /><sub><b>Scott Solmonson</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=ssolmonson" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/simk209"><img src="https://avatars.githubusercontent.com/u/122063210?v=4?s=100" width="100px;" alt="Simran Kaur"/><br /><sub><b>Simran Kaur</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=simk209" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://soundarmurugan.com"><img src="https://avatars.githubusercontent.com/u/55850316?v=4?s=100" width="100px;" alt="Soundar Murugan"/><br /><sub><b>Soundar Murugan</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=soundarzozm" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Slam256"><img src="https://avatars.githubusercontent.com/u/96086935?v=4?s=100" width="100px;" alt="Stacey Ali"/><br /><sub><b>Stacey Ali</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=Slam256" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://timblaisdesigns.netlify.app/"><img src="https://avatars.githubusercontent.com/u/97904016?v=4?s=100" width="100px;" alt="Tim Blais"/><br /><sub><b>Tim Blais</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=timblais" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tommagnusson"><img src="https://avatars.githubusercontent.com/u/11342238?v=4?s=100" width="100px;" alt="Tom Magnusson"/><br /><sub><b>Tom Magnusson</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=tommagnusson" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ujwalkumar1995"><img src="https://avatars.githubusercontent.com/u/20976813?v=4?s=100" width="100px;" alt="Ujwal Kumar"/><br /><sub><b>Ujwal Kumar</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=ujwalkumar1995" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/veronicaadler"><img src="https://avatars.githubusercontent.com/u/83320256?v=4?s=100" width="100px;" alt="Veronica Adler"/><br /><sub><b>Veronica Adler</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=veronicaadler" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/YuhaoT"><img src="https://avatars.githubusercontent.com/u/30719318?v=4?s=100" width="100px;" alt="YuhaoT"/><br /><sub><b>YuhaoT</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=YuhaoT" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ananyasinghz"><img src="https://avatars.githubusercontent.com/u/143516466?v=4?s=100" width="100px;" alt="ananyasinghz"/><br /><sub><b>ananyasinghz</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=ananyasinghz" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/arutfield"><img src="https://avatars.githubusercontent.com/u/36383013?v=4?s=100" width="100px;" alt="arutfield"/><br /><sub><b>arutfield</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=arutfield" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bancona"><img src="https://avatars.githubusercontent.com/u/5554068?v=4?s=100" width="100px;" alt="bancona"/><br /><sub><b>bancona</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=bancona" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/d-ondrich"><img src="https://avatars.githubusercontent.com/u/25425042?v=4?s=100" width="100px;" alt="d.ondrich"/><br /><sub><b>d.ondrich</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=d-ondrich" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/djtanner"><img src="https://avatars.githubusercontent.com/u/3960256?v=4?s=100" width="100px;" alt="djtanner"/><br /><sub><b>djtanner</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=djtanner" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.ekambains.com"><img src="https://avatars.githubusercontent.com/u/182202895?v=4?s=100" width="100px;" alt="ekambains"/><br /><sub><b>ekambains</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=ekambains" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/iWumboUWumbo2"><img src="https://avatars.githubusercontent.com/u/17531877?v=4?s=100" width="100px;" alt="iWumboUWumbo2"/><br /><sub><b>iWumboUWumbo2</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=iWumboUWumbo2" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ishana-goyal"><img src="https://avatars.githubusercontent.com/u/88641809?v=4?s=100" width="100px;" alt="ishana-goyal"/><br /><sub><b>ishana-goyal</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=ishana-goyal" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jamesvas5307"><img src="https://avatars.githubusercontent.com/u/14347149?v=4?s=100" width="100px;" alt="jamesvas5307"/><br /><sub><b>jamesvas5307</b></sub></a><br /><a href="#design-jamesvas5307" title="Design">🎨</a> <a href="#mentoring-jamesvas5307" title="Mentoring">🧑‍🏫</a> <a href="#userTesting-jamesvas5307" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jellyyams"><img src="https://avatars.githubusercontent.com/u/53629007?v=4?s=100" width="100px;" alt="jellyyams"/><br /><sub><b>jellyyams</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=jellyyams" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jkinzer85"><img src="https://avatars.githubusercontent.com/u/80472427?v=4?s=100" width="100px;" alt="jkinzer85"/><br /><sub><b>jkinzer85</b></sub></a><br /><a href="#userTesting-jkinzer85" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mertbagt"><img src="https://avatars.githubusercontent.com/u/73559781?v=4?s=100" width="100px;" alt="mertbagt"/><br /><sub><b>mertbagt</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=mertbagt" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mmailloux22"><img src="https://avatars.githubusercontent.com/u/48417120?v=4?s=100" width="100px;" alt="mmailloux22"/><br /><sub><b>mmailloux22</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=mmailloux22" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mvictor55"><img src="https://avatars.githubusercontent.com/u/71357256?v=4?s=100" width="100px;" alt="mvictor55"/><br /><sub><b>mvictor55</b></sub></a><br /><a href="#business-mvictor55" title="Business development">💼</a> <a href="#projectManagement-mvictor55" title="Project Management">📆</a> <a href="#fundingFinding-mvictor55" title="Funding Finding">🔍</a> <a href="https://github.com/codeforboston/maple/commits?author=mvictor55" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pranay8297"><img src="https://avatars.githubusercontent.com/u/47974414?v=4?s=100" width="100px;" alt="pranay"/><br /><sub><b>pranay</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=pranay8297" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ren0nie0"><img src="https://avatars.githubusercontent.com/u/32780767?v=4?s=100" width="100px;" alt="ren0nie0"/><br /><sub><b>ren0nie0</b></sub></a><br /><a href="#research-ren0nie0" title="Research">🔬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sammymyi"><img src="https://avatars.githubusercontent.com/u/105759252?v=4?s=100" width="100px;" alt="sammymyi"/><br /><sub><b>sammymyi</b></sub></a><br /><a href="#design-sammymyi" title="Design">🎨</a> <a href="#userTesting-sammymyi" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sashamaryl"><img src="https://avatars.githubusercontent.com/u/30247522?v=4?s=100" width="100px;" alt="sashamaryl"/><br /><sub><b>sashamaryl</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=sashamaryl" title="Code">💻</a> <a href="#mentoring-sashamaryl" title="Mentoring">🧑‍🏫</a> <a href="#research-sashamaryl" title="Research">🔬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shannonh800"><img src="https://avatars.githubusercontent.com/u/113308101?v=4?s=100" width="100px;" alt="shannonh800"/><br /><sub><b>shannonh800</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=shannonh800" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/yasminekarni"><img src="https://avatars.githubusercontent.com/u/47721405?v=4?s=100" width="100px;" alt="yasminekarni"/><br /><sub><b>yasminekarni</b></sub></a><br /><a href="https://github.com/codeforboston/maple/commits?author=yasminekarni" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This table follows the [All Contributors](https://allcontributors.org/) specification and is managed by the @all-contributors bot. You can add yourself or another contributor by [commenting on an issue or a pull request](https://allcontributors.org/docs/en/bot/usage).
