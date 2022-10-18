import fs from "fs"
import yaml from "js-yaml"
import { isEmpty } from "lodash"
import Mustache from "mustache"
import { dirname, join, resolve } from "path"
import { Record, Static, String } from "runtypes"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

type Config = Static<typeof Config>
const Config = Record({
  name: String,
  folder: String,
  grouping: String,
  figmaUrl: String
})

const paths = {
  outDir: resolve(__dirname, "../stories"),
  defaultStoriesConfig: resolve(__dirname, "stories.yml"),
  defaultTemplate: resolve(__dirname, "stories-template.mustache")
}

function generateStory(template: string, config: Config) {
  const out = join(paths.outDir, config.folder, `${config.name}.stories.tsx`)
  if (fs.existsSync(out)) {
    console.warn(out, "exists, skipping")
    return
  }

  const story = Mustache.render(template, config)
  fs.mkdirSync(dirname(out), { recursive: true })
  fs.writeFileSync(out, story, {
    flag: "wx"
  })
}

function generateStories(templatePath: string, storiesPath: string) {
  const template = fs.readFileSync(templatePath, "utf8")
  yaml
    .loadAll(fs.readFileSync(storiesPath, "utf8"))
    .filter(c => !isEmpty(c))
    .map(c => {
      const validated = Config.validate(c)
      if (!validated.success) {
        console.log("Invalid config", validated.message, validated.details)
        process.exit(1)
      }
      return validated.value
    })
    .forEach(story => generateStory(template, story))
}

const argv = yargs(hideBin(process.argv))
  .scriptName("generate-stories")
  .option("template", {
    type: "string",
    default: paths.defaultTemplate,
    describe: "Path to a mustache template used to generate the stories"
  })
  .option("stories", {
    type: "string",
    default: paths.defaultStoriesConfig,
    describe:
      "Path to a multi-document yaml file with story configs. Each config is a map with name, folder, grouping, and figmaUrl fields."
  }).argv

generateStories(argv.template, argv.stories)
