import yargs from "yargs"

yargs(process.argv.slice(2))
  .scriptName("analyze")
  .command(
    "downloadHistories",
    "download all bill histories",
    yargs =>
      yargs.option("out", {
        string: true,
        default: "../data/all-history-actions"
      }),
    ({ out }) => import("./loader").then(m => m.downloadHistory(out))
  )
  .command(
    "calculateLinks",
    "calculate links between bills",
    yargs =>
      yargs
        .option("matched", {
          string: true,
          default: "../data/matched-actions.json"
        })
        .option("out", {
          string: true,
          default: "../data/linked-bills.json"
        }),
    ({ matched, out }) =>
      import("./calculateLinks").then(m => m.calculateLinks(matched, out))
  )
  .command(
    "classify",
    "classify bill histories",
    yargs =>
      yargs
        .option("watch", { boolean: true, default: false })
        .option("actions", {
          string: true,
          default: "../data/all-history-actions.csv"
        })
        .option("rules", { string: true, default: "rules.ts" }),
    ({ actions, rules, watch }) =>
      import("./Classifier").then(async ({ Classifier }) => {
        const classifier = new Classifier({
          actionsPath: actions,
          rulesPath: rules
        })
        if (watch) await classifier.watch()
        else classifier.run()
      })
  )
  .demandCommand().argv
