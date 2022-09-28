# Massachusetts Platform for Legislative Engagement (MAPLE)

A legislative testimony project through Code for Boston!

## Essentials

Join the [Code for Boston Slack](https://communityinviter.com/apps/cfb-public/default-badge) and our `#legislative-testimony` channel. Ask to join the Zenhub and Zeplin projects.

Attend a [weekly hack night at Code for Boston](https://www.meetup.com/code-for-boston/events/) and join our group.

You can find good first issues [here](https://github.com/codeforboston/advocacy-maps/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).

Check out the [Contributing](./Contributing.md) docs for how to contribute to the project.

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

## Contributors

Thanks to all our contributors!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/0lafe"><img src="https://avatars.githubusercontent.com/u/21280852?v=4?s=100" width="100px;" alt="0lafe"/><br /><sub><b>0lafe</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=0lafe" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/alexjball"><img src="https://avatars.githubusercontent.com/u/8595776?v=4?s=100" width="100px;" alt="Alex Ball"/><br /><sub><b>Alex Ball</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=alexjball" title="Code">💻</a> <a href="https://github.com/codeforboston/advocacy-maps/pulls?q=is%3Apr+reviewed-by%3Aalexjball" title="Reviewed Pull Requests">👀</a> <a href="#mentoring-alexjball" title="Mentoring">🧑‍🏫</a></td>
      <td align="center"><a href="https://github.com/AnnaKSteele"><img src="https://avatars.githubusercontent.com/u/6483197?v=4?s=100" width="100px;" alt="Anna Steele"/><br /><sub><b>Anna Steele</b></sub></a><br /><a href="#business-AnnaKSteele" title="Business development">💼</a> <a href="#projectManagement-AnnaKSteele" title="Project Management">📆</a></td>
      <td align="center"><a href="https://bhrutledge.com/"><img src="https://avatars.githubusercontent.com/u/1326704?v=4?s=100" width="100px;" alt="Brian Rutledge"/><br /><sub><b>Brian Rutledge</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=bhrutledge" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/bhinebaugh"><img src="https://avatars.githubusercontent.com/u/466561?v=4?s=100" width="100px;" alt="Byron Kent Hinebaugh"/><br /><sub><b>Byron Kent Hinebaugh</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=bhinebaugh" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/cbmacd1213"><img src="https://avatars.githubusercontent.com/u/67985403?v=4?s=100" width="100px;" alt="Colin MacDonald"/><br /><sub><b>Colin MacDonald</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=cbmacd1213" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/almaraz333"><img src="https://avatars.githubusercontent.com/u/60356596?v=4?s=100" width="100px;" alt="Colton Almaraz"/><br /><sub><b>Colton Almaraz</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=almaraz333" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/Dev1nxavier"><img src="https://avatars.githubusercontent.com/u/7763861?v=4?s=100" width="100px;" alt="Dev1nxavier"/><br /><sub><b>Dev1nxavier</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=Dev1nxavier" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/jkoren"><img src="https://avatars.githubusercontent.com/u/67333843?v=4?s=100" width="100px;" alt="Jeff Korenstein"/><br /><sub><b>Jeff Korenstein</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=jkoren" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/KY233466"><img src="https://avatars.githubusercontent.com/u/81402259?v=4?s=100" width="100px;" alt="KY233466"/><br /><sub><b>KY233466</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=KY233466" title="Code">💻</a></td>
      <td align="center"><a href="https://kepweb.dev/"><img src="https://avatars.githubusercontent.com/u/19396186?v=4?s=100" width="100px;" alt="Kep Kaeppeler"/><br /><sub><b>Kep Kaeppeler</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=Keparoo" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/pololeningcelaya"><img src="https://avatars.githubusercontent.com/u/57147656?v=4?s=100" width="100px;" alt="Leopoldo Lening Celaya"/><br /><sub><b>Leopoldo Lening Celaya</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=pololeningcelaya" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/luke-rucker"><img src="https://avatars.githubusercontent.com/u/10203352?v=4?s=100" width="100px;" alt="Luke Rucker"/><br /><sub><b>Luke Rucker</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=luke-rucker" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/NONstiky"><img src="https://avatars.githubusercontent.com/u/16812993?v=4?s=100" width="100px;" alt="Marcos Banchik"/><br /><sub><b>Marcos Banchik</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=NONstiky" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://www.zagaja.com/"><img src="https://avatars.githubusercontent.com/u/565647?v=4?s=100" width="100px;" alt="Matthew Zagaja"/><br /><sub><b>Matthew Zagaja</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=mzagaja" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/mikeyavorsky"><img src="https://avatars.githubusercontent.com/u/1855512?v=4?s=100" width="100px;" alt="Mike Yavorsky"/><br /><sub><b>Mike Yavorsky</b></sub></a><br /><a href="#design-mikeyavorsky" title="Design">🎨</a></td>
      <td align="center"><a href="https://github.com/kilometers"><img src="https://avatars.githubusercontent.com/u/6674848?v=4?s=100" width="100px;" alt="Miles Baird"/><br /><sub><b>Miles Baird</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=kilometers" title="Code">💻</a></td>
      <td align="center"><a href="https://minqichai.notion.site/"><img src="https://avatars.githubusercontent.com/u/44985426?v=4?s=100" width="100px;" alt="Minqi Chai"/><br /><sub><b>Minqi Chai</b></sub></a><br /><a href="#userTesting-mchai1218" title="User Testing">📓</a></td>
      <td align="center"><a href="https://github.com/nesanders"><img src="https://avatars.githubusercontent.com/u/1727426?v=4?s=100" width="100px;" alt="Nathan Sanders"/><br /><sub><b>Nathan Sanders</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=nesanders" title="Code">💻</a> <a href="#business-nesanders" title="Business development">💼</a> <a href="#fundingFinding-nesanders" title="Funding Finding">🔍</a></td>
      <td align="center"><a href="https://www.richardkwon.com/"><img src="https://avatars.githubusercontent.com/u/24848125?v=4?s=100" width="100px;" alt="Richard Kwon"/><br /><sub><b>Richard Kwon</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=Rae-Kwon" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/rileyhgrant"><img src="https://avatars.githubusercontent.com/u/59549713?v=4?s=100" width="100px;" alt="Riley Grant"/><br /><sub><b>Riley Grant</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=rileyhgrant" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/RobertMrowiec"><img src="https://avatars.githubusercontent.com/u/25043084?v=4?s=100" width="100px;" alt="RobertMrowiec"/><br /><sub><b>RobertMrowiec</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=RobertMrowiec" title="Code">💻</a> <a href="https://github.com/codeforboston/advocacy-maps/pulls?q=is%3Apr+reviewed-by%3ARobertMrowiec" title="Reviewed Pull Requests">👀</a></td>
      <td align="center"><a href="https://rodrigopassos.com/"><img src="https://avatars.githubusercontent.com/u/994788?v=4?s=100" width="100px;" alt="Rodrigo Passos"/><br /><sub><b>Rodrigo Passos</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=webrgp" title="Code">💻</a> <a href="https://github.com/codeforboston/advocacy-maps/pulls?q=is%3Apr+reviewed-by%3Awebrgp" title="Reviewed Pull Requests">👀</a></td>
      <td align="center"><a href="https://github.com/ssolmonson"><img src="https://avatars.githubusercontent.com/u/58236786?v=4?s=100" width="100px;" alt="Scott Solmonson"/><br /><sub><b>Scott Solmonson</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=ssolmonson" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/veronicaadler"><img src="https://avatars.githubusercontent.com/u/83320256?v=4?s=100" width="100px;" alt="Veronica Adler"/><br /><sub><b>Veronica Adler</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=veronicaadler" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/arutfield"><img src="https://avatars.githubusercontent.com/u/36383013?v=4?s=100" width="100px;" alt="arutfield"/><br /><sub><b>arutfield</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=arutfield" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/bancona"><img src="https://avatars.githubusercontent.com/u/5554068?v=4?s=100" width="100px;" alt="bancona"/><br /><sub><b>bancona</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=bancona" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/d-ondrich"><img src="https://avatars.githubusercontent.com/u/25425042?v=4?s=100" width="100px;" alt="d.ondrich"/><br /><sub><b>d.ondrich</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=d-ondrich" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/djtanner"><img src="https://avatars.githubusercontent.com/u/3960256?v=4?s=100" width="100px;" alt="djtanner"/><br /><sub><b>djtanner</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=djtanner" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/jamesvas5307"><img src="https://avatars.githubusercontent.com/u/14347149?v=4?s=100" width="100px;" alt="jamesvas5307"/><br /><sub><b>jamesvas5307</b></sub></a><br /><a href="#design-jamesvas5307" title="Design">🎨</a> <a href="#mentoring-jamesvas5307" title="Mentoring">🧑‍🏫</a> <a href="#userTesting-jamesvas5307" title="User Testing">📓</a></td>
      <td align="center"><a href="https://github.com/mmailloux22"><img src="https://avatars.githubusercontent.com/u/48417120?v=4?s=100" width="100px;" alt="mmailloux22"/><br /><sub><b>mmailloux22</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=mmailloux22" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/mvictor55"><img src="https://avatars.githubusercontent.com/u/71357256?v=4?s=100" width="100px;" alt="mvictor55"/><br /><sub><b>mvictor55</b></sub></a><br /><a href="#business-mvictor55" title="Business development">💼</a> <a href="#projectManagement-mvictor55" title="Project Management">📆</a> <a href="#fundingFinding-mvictor55" title="Funding Finding">🔍</a> <a href="https://github.com/codeforboston/advocacy-maps/commits?author=mvictor55" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/ren0nie0"><img src="https://avatars.githubusercontent.com/u/32780767?v=4?s=100" width="100px;" alt="ren0nie0"/><br /><sub><b>ren0nie0</b></sub></a><br /><a href="#research-ren0nie0" title="Research">🔬</a></td>
      <td align="center"><a href="https://github.com/sammymyi"><img src="https://avatars.githubusercontent.com/u/105759252?v=4?s=100" width="100px;" alt="sammymyi"/><br /><sub><b>sammymyi</b></sub></a><br /><a href="#design-sammymyi" title="Design">🎨</a> <a href="#userTesting-sammymyi" title="User Testing">📓</a></td>
      <td align="center"><a href="https://github.com/sashamaryl"><img src="https://avatars.githubusercontent.com/u/30247522?v=4?s=100" width="100px;" alt="sashamaryl"/><br /><sub><b>sashamaryl</b></sub></a><br /><a href="https://github.com/codeforboston/advocacy-maps/commits?author=sashamaryl" title="Code">💻</a> <a href="#mentoring-sashamaryl" title="Mentoring">🧑‍🏫</a> <a href="#research-sashamaryl" title="Research">🔬</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This table follows the [All Contributors](https://allcontributors.org/) specification and is managed by the @all-contributors bot. You can add yourself or another contributor by [commenting on an issue or a pull request](https://allcontributors.org/docs/en/bot/usage).
