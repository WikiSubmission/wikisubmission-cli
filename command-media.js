const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");
const { default: WikiSubmission } = require("wikisubmission-sdk");

exports.default = new Command()
  .name("m")
  .alias("media")
  .description("Search media references from Dr. Rashad Khalifa")
  .argument("<string...>", "search")
  .option("-e, --extent <sermons|programs|audios|all>", "Extent", "all")
  .option("-ss, --strict", "Ensure identical word order in text search", false)
  .action(async (query, options) => {
    baseLog();

    query = query.join(" ");

    let { strict, extent } = options;

    const ws = WikiSubmission.createClient();

    const results = await ws.Media.query(query, {
      highlight: true,
      strategy: strict ? "strict" : "default",
      extent: extent !== "all" ? extent : undefined,
    });

    if (results.data && results.data.length > 0) {
      if (results.type === "search" && results.totalMatches) {
        logger
          .color("green")
          .bold()
          .underscore()
          .log(
            `${results.metadata.formattedQuery} (${results.totalMatches} result${results.totalMatches > 1 ? "s" : ""})\n`
          );
      } else {
        logger
          .color("green")
          .bold()
          .underscore()
          .log(
            `${results.data.length} result${results.data.length > 1 ? "s" : ""
            } for "${query}"\n`
          );
      }

      for (const media of results.data) {
        logger
          .color("magenta")
          .log(
            `${
              media.markdown?.split("]")[0]?.split("[")[1] || media.title || ""
            } - https://youtu.be/${media.youtube_id}?t=${
              media.youtube_timestamp
            }`
          );
        logger.log(formatMarkdown(`"${media.transcript}"` + "\n"));
      }
    } else {
      logger.color("yellow").bold().underscore().log(`No results\n`);
    }
  });
