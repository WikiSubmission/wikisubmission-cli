#!/usr/bin/env node

const { Command } = require("commander");

(async () => {
  const program = new Command();

  program
    .name("ws")
    .alias("wikisubmission")
    .description("Command Line Interface (CLI) for WikiSubmission")
    .version(require("../package.json").version);

  program.addCommand(require("../command-quran").default);
  program.addCommand(require("../command-media").default);
  program.addCommand(require("../command-newsletters").default);
  program.addCommand(require("../command-prayertimes").default);
  program.showHelpAfterError();

  // Run command
  try {
    await program.parseAsync();
  } catch (error) {
    console.error("Error parsing command:", error);
    process.exit(1);
  }

  // Check for updates
  try {
    const updateNotifierModule = await import("update-notifier");
    const updateNotifier = updateNotifierModule.default;

    const notifier = updateNotifier({
      pkg: require("../package.json"),
      updateCheckInterval: 1000 * 60 * 60 * 24 * 3,
    });

    notifier.notify();
  } catch (error) {
    console.error("Error checking for updates:", error);
  }
})();
