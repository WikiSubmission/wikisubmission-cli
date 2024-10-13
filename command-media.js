const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");

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

    const fetchURL = new URL(
      `https://api.wikisubmission.org/moc/media/search`
    );
    fetchURL.searchParams.append("q", query);
    fetchURL.searchParams.append("highlight", "true");
    if (strict === false) fetchURL.searchParams.append("iwo", "true");
    if (extent !== "all") fetchURL.searchParams.append("extent", extent);

    const request = await fetch(fetchURL);
    const response = await request.json();

    if (response.results?.length > 0 && !response.error) {
      logger
        .color("green")
        .bold()
        .underscore()
        .log(
          `${response.results.length} result${
            response.results.length > 1 ? "s" : ""
          } for "${query}"\n`
        );

      for (const media of response.results) {
        logger
          .color("magenta")
          .log(
            `${
              media.media_markdown.split("]")[0].split("[")[1]
            } - https://youtu.be/${media.media_youtube_id}?t=${
              media.media_youtube_timestamp
            }`
          );
        logger.log(formatMarkdown(`"${media.media_transcript}"` + "\n"));
      }
    } else if (!response.error) {
      logger.color("yellow").bold().underscore().log(`No results\n`);
    } else if (response.error?.name) {
      logger.color("red").bold().underscore().log(`${response.error.name}\n`);
      logger.color("red").log(`${response.error.description || "--"}\n`);
    } else {
      logger.color("red").bold().log(`Invalid request\n`);
    }
  });
