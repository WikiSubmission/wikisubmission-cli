const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");

exports.default = new Command()
  .name("prayertimes")
  .alias("pt")
  .description("Get live prayer times for any part of the world")
  .argument("<string...>", "search")
  .option("-mm, --midpoint_method", "Use midpoint method for Asr prayer", false)
  .action(async (query, options) => {
    baseLog();

    query = query.join(" ");

    const fetchURL = new URL(
      `https://practices.wikisubmission.org/prayer-times/${query}`
    );
    fetchURL.searchParams.append("highlight", "true");
    if (options.midpoint_method) {
      fetchURL.searchParams.append("asr_adjustment", "true");
    }

    const request = await fetch(fetchURL);
    const response = await request.json();

    if (!response.error) {
      logger
        .color("green")
        .bold()
        .underscore()
        .log(`${response.location_string}`);

      logger
        .color("white")
        .log(
          `${response.local_time} (${response.local_timezone})\n`
        );
      logger.bgColor("magenta").color("black").bold().log(`Live Status`);
      logger
        .color("yellow")
        .log(`${formatMarkdown(response.status_string)}\n`);

      logger.bgColor("magenta").color("black").bold().log(`Schedule`);
      logger.color("white").log(`Fajr: ${response.times.fajr}`);
      logger.color("white").log(`Dhuhr: ${response.times.dhuhr}`);
      logger.color("white").log(`Asr: ${response.times.asr}`);
      logger.color("white").log(`Maghrib: ${response.times.maghrib}`);
      logger.color("white").log(`Isha: ${response.times.isha}`);
      logger.color("white").log(`Sunrise: ${response.times.sunrise}\n`);

      logger.bgColor("magenta").color("black").bold().log(`Times Left`);
      logger.color("white").log(`Fajr: ${response.times_left.fajr}`);
      logger.color("white").log(`Dhuhr: ${response.times_left.dhuhr}`);
      logger.color("white").log(`Asr: ${response.times_left.asr}`);
      logger
        .color("white")
        .log(`Maghrib: ${response.times_left.maghrib}`);
      logger.color("white").log(`Isha: ${response.times_left.isha}`);
      logger
        .color("white")
        .log(`Sunrise: ${response.times_left.sunrise}`);
    } else if (!response.error) {
      logger.color("yellow").bold().underscore().log(`No results\n`);
    } else if (response.error?.name) {
      logger.color("red").bold().underscore().log(`${response.error.name}\n`);
      logger.color("red").log(`${response.error.description || "--"}\n`);
    } else {
      logger.color("red").bold().log(`Invalid request\n`);
    }
  });
