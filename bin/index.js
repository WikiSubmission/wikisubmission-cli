#!/usr/bin/env node

const { Command } = require("commander");
const pkg = require("../package.json");

(async () => {
  const program = new Command();

  program
    .name("ws")
    .alias("wikisubmission")
    .description("Command Line Interface (CLI) for WikiSubmission")
    .version(pkg.version);

  program.addCommand(require("../command-quran").default);
  program.addCommand(require("../command-media").default);
  program.addCommand(require("../command-newsletters").default);
  program.addCommand(require("../command-prayertimes").default);
  program.showHelpAfterError();

  // Check for updates
  try {
    const { default: updateNotifier } = await import("update-notifier");
    const notifier = updateNotifier({
      pkg,
      updateCheckInterval: 1000 * 60 * 60 * 24, // Check once per day
      shouldNotifyInNpmScript: true,
    });

    if (notifier.update) {
      notifier.notify({
        message: `Update available ${notifier.update.current} → ${notifier.update.latest}\nRun ${notifier.update.type === 'major' ? 'npm install -g wikisubmission-cli@latest' : 'npm update -g wikisubmission-cli'} to update`,
        defer: false,
      });
    }
  } catch (error) {
    // Silently fail if update check fails
  }

  // Run command
  try {
    await program.parseAsync();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
