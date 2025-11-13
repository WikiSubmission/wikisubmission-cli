const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");
const { default: WikiSubmission } = require("wikisubmission-sdk");

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

    const ws = WikiSubmission.createClient();

    const results = await ws.Newsletters.query(query, {
      highlight: true,
      strategy: strict ? "strict" : "default",
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

      for (const sp of results.data) {
        logger
          .color("white")
          .log(
            `-------\n${sp.year} ${capitalizeFirstLetter(
              sp.month
            )} (page ${sp.page}): "${formatMarkdown(
              sp.content
            )}"\n\nReference: https://www.masjidtucson.org/publications/books/sp/${sp.year
            }/${sp.month}/page${sp.page
            }.html\nFull PDF: https://library.wikisubmission.org/file/sp/${sp.year
            }_${sp.month}`
          );
      }
    } else {
      logger.color("yellow").bold().underscore().log(`No results\n`);
    }
  });

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
