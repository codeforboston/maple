import * as handlebars from "handlebars"
import * as fs from "fs"
import * as path from "path"
import * as helpers from "./helpers"

const PARTIALS_DIR = "../../lib/email/partials"

// Register Handlebars helper functions
export const registerHelpers = () => {
  handlebars.registerHelper("addCounts", helpers.addCounts)
  handlebars.registerHelper("toLowerCase", helpers.toLowerCase)
  handlebars.registerHelper("noUpdatesFormat", helpers.noUpdatesFormat)
  handlebars.registerHelper("isDefined", helpers.isDefined)
}

// Register all Handlebars partials
export const registerPartials = (directoryPath: string) => {
  const filenames = fs.readdirSync(directoryPath)
  filenames.forEach(filename => {
    const partialPath = path.join(directoryPath, filename)
    const stats = fs.statSync(partialPath)
    if (stats.isDirectory()) {
      registerPartials(partialPath)
    } else if (stats.isFile() && path.extname(filename) === ".handlebars") {
      const partialName = path.basename(filename, ".handlebars")
      const partialContent = fs.readFileSync(partialPath, "utf8")
      handlebars.registerPartial(partialName, partialContent)
    }
  })
}

export const prepareHandlebars = () => {
  registerHelpers()
  registerPartials(path.join(__dirname, PARTIALS_DIR))
}
