const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");

exports.default = new Command()
  .name("prayertimes")
  .alias("pt")
  .description("Get live prayer times for any part of the world")
  .argument("<string...>", "search")
  .action(async (query, options) => {
    baseLog();

    query = query.join(" ");

    const fetchURL = new URL(
      `https://api.wikisubmission.org/prayer-times`
    );
    fetchURL.searchParams.append("q", query);
    fetchURL.searchParams.append("highlight", "true");

    const request = await fetch(fetchURL);
    const response = await request.json();

    if (response.results && !response.error) {
      logger
        .color("green")
        .bold()
        .underscore()
        .log(`${response.results.location_string}`);

      logger
        .color("white")
        .log(
          `${response.results.local_time} (${response.results.local_timezone})\n`
        );
      logger.bgColor("magenta").color("black").bold().log(`Live Status`);
      logger
        .color("yellow")
        .log(`${formatMarkdown(response.results.status_string)}\n`);

      logger.bgColor("magenta").color("black").bold().log(`Schedule`);
      logger.color("white").log(`Fajr: ${response.results.times.fajr}`);
      logger.color("white").log(`Dhuhr: ${response.results.times.dhuhr}`);
      logger.color("white").log(`Asr: ${response.results.times.asr}`);
      logger.color("white").log(`Maghrib: ${response.results.times.maghrib}`);
      logger.color("white").log(`Isha: ${response.results.times.isha}`);
      logger.color("white").log(`Sunrise: ${response.results.times.sunrise}\n`);

      logger.bgColor("magenta").color("black").bold().log(`Times Left`);
      logger.color("white").log(`Fajr: ${response.results.times_left.fajr}`);
      logger.color("white").log(`Dhuhr: ${response.results.times_left.dhuhr}`);
      logger.color("white").log(`Asr: ${response.results.times_left.asr}`);
      logger
        .color("white")
        .log(`Maghrib: ${response.results.times_left.maghrib}`);
      logger.color("white").log(`Isha: ${response.results.times_left.isha}`);
      logger
        .color("white")
        .log(`Sunrise: ${response.results.times_left.sunrise}`);
    } else if (!response.error) {
      logger.color("yellow").bold().underscore().log(`No results\n`);
    } else if (response.error?.name) {
      logger.color("red").bold().underscore().log(`${response.error.name}\n`);
      logger.color("red").log(`${response.error.description || "--"}\n`);
    } else {
      logger.color("red").bold().log(`Invalid request\n`);
    }
  });
