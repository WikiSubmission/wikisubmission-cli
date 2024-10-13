const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");

exports.default = new Command()
  .name("newsletters")
  .aliases(["n", "sp"])
  .description("Search newsletter references from the Submitters Perspectives")
  .argument("<string...>", "search")
  .option("-ss, --strict", "Ensure identical word order in text search", false)
  .action(async (query, options) => {
    baseLog();

    query = query.join(" ");

    let { strict } = options;

    const fetchURL = new URL(
      `https://api.wikisubmission.org/moc/newsletters/search`
    );
    fetchURL.searchParams.append("q", query);
    fetchURL.searchParams.append("highlight", "true");
    if (strict === false) fetchURL.searchParams.append("iwo", "true");

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

      for (const sp of response.results) {
        logger
          .color("white")
          .log(
            `-------\n${sp.sp_year} ${capitalizeFirstLetter(
              sp.sp_month
            )} (page ${sp.sp_page}): "${formatMarkdown(
              sp.sp_content
            )}"\n\nReference: https://www.masjidtucson.org/publications/books/sp/${
              sp.sp_year
            }/${sp.sp_month}/page${
              sp.sp_page
            }.html\nFull PDF: https://docs.wikisubmission.org/library/sp/${
              sp.sp_year
            }_${sp.sp_month}`
          );
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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
