const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog } = require("./utils");

exports.default = new Command()
  .name("library")
  .alias("l")
  .description("Get links to Submission resources")
  .argument("<string...>", "search")
  .option("--limit <number>", "Limit the number of results", 10)
  .action(async (query, options) => {
    baseLog();

    query = query.join(" ");

    const fetchURL = new URL(
      `https://library.wikisubmission.org/search/`
    );
    fetchURL.searchParams.append("q", query);

    const request = await fetch(fetchURL);
    const response = await request.json();

    if (response.files && !response.error) {
      logger
        .color("green")
        .bold()
        .underscore()
        .log(`${response.message}\n`);

      const displayCount = Math.min(response.files.length, options.limit);

      for (let i = 0; i < displayCount; i++) {
        const file = response.files[i];
        logger.color("yellow").log(`${i + 1}. ${file.folder}/${file.name}`);
        logger.color("magenta").log(`${file.url}\n`);
      }

      const remainingCount = response.files.length - displayCount;
      if (remainingCount > 0) {
        logger.color("yellow").log(`...${remainingCount} more (use --limit to increase)\n`);
      }

    } else if (response.error) {
      logger.color("red").bold().underscore().log(`${response.error}\n`);
    } else {
      logger.color("red").bold().log(`Invalid request\n`);
    }
  });
