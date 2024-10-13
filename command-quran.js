const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");

exports.default = new Command()
  .name("quran")
  .aliases(["q", "*"])
  .description("Lookup verses or search text from Quran: The Final Testament")
  .argument("<string...>", "search")
  .option(
    "-lan, --language <string>",
    "Load results in a specific language (if supported)",
    "english"
  )
  .option("-ar, --arabic", "Include Arabic text", false)
  .option("-tr, --transliteration", "Include Arabic transliteration", false)
  .option(
    "-nc, --nocommentary",
    "Don't include any subtitles or footnotes",
    false
  )
  .option(
    "-ngc, --normalizegodcapitalization",
    "Normalize capitalization of 'God'",
    false
  )
  .option("-s, --strict", "Ensure identical word order in text search", false)
  .action(async (query, options) => {
    baseLog();

    query = query.join(" ");

    let {
      language,
      arabic,
      transliteration,
      nocommentary,
      strict,
      normalizegodcapitalization,
    } = options;

    if (query === "rv" || query === "randomverse") {
      return randomVerse();
    }

    if (query === "rc" || query === "randomchapter") {
      return randomChapter();
    }

    const fetchURL = new URL(`https://api.wikisubmission.org/quran/search`);
    fetchURL.searchParams.append("q", query);
    fetchURL.searchParams.append("highlight", "true");
    if (language) fetchURL.searchParams.append("language", language);
    if (strict === false) fetchURL.searchParams.append("iwo", "true");
    if (nocommentary) fetchURL.searchParams.append("ic", "true");
    if (normalizegodcapitalization === true)
      fetchURL.searchParams.append("ngc", "true");

    const request = await fetch(fetchURL);
    const response = await request.json();

    logVerses(
      response,
      response.results.length > 0
        ? response.results.every(
            (i) => i.chapter_number === response.results[0].chapter_number
          )
          ? false
          : true
        : true
    );

    /**
     * Helper functions
     */
    async function randomVerse() {
      try {
        const fetchURL = new URL(
          `https://api.wikisubmission.org/quran/random-verse`
        );
        if (normalizegodcapitalization === true)
          fetchURL.searchParams.append("ngc", "true");

        const request = await fetch(fetchURL);
        const response = await request.json();
        logVerses(response, false);
      } catch (error) {
        logger.color("red").log(`API Error. Please try again later.`);
        logger.dim().log(`"${error.message}"\n`);
        return;
      }
    }

    async function randomChapter() {
      try {
        const fetchURL = new URL(
          `https://api.wikisubmission.org/quran/random-chapter`
        );
        if (normalizegodcapitalization === true)
          fetchURL.searchParams.append("ngc", "true");

        const request = await fetch(fetchURL);
        const response = await request.json();
        logVerses(response, false);
      } catch (error) {
        logger.color("red").log(`API Error. Please try again later.`);
        logger.dim().log(`"${error.message}"\n`);
        return;
      }
    }

    function logVerses(response, showResultTally = true) {
      if (response.results?.length > 0 && !response.error) {
        if (showResultTally) {
          logger
            .color("green")
            .bold()
            .underscore()
            .log(
              `${response.results.length} result${
                response.results.length > 1 ? "s" : ""
              } for "${query}"\n`
            );
        }

        for (const verse of response.results) {
          if (!language) language = "english";
          if (!nocommentary) {
            const subtitle =
              verse[
                `verse_subtitle_${language}` in verse
                  ? `verse_subtitle_${language}`
                  : `verse_subtitle_english`
              ];
            if (subtitle && subtitle !== "null") {
              const formattedSubtitleText = formatMarkdown(subtitle, "magenta");
              logger.color("magenta").log(formattedSubtitleText + "\n");
            }
          }

          const verseText =
            verse[
              `verse_text_${language}` in verse
                ? `verse_text_${language}`
                : `verse_text_english`
            ];

          const formattedVerseText = formatMarkdown(verseText);

          logger
            .color("white")
            .log(`[${verse.verse_id}] ${formattedVerseText}` + "\n");

          if (arabic) {
            logger.color("white").log(`${verse.verse_text_arabic}` + "\n");
          }

          if (transliteration) {
            logger
              .color("white")
              .log(`${verse.verse_text_arabic_transliteration}` + "\n");
          }

          if (!nocommentary) {
            const footnote =
              verse[
                `verse_footnote_${language}` in verse
                  ? `verse_footnote_${language}`
                  : `verse_footnote_english`
              ];
            if (footnote && footnote !== "null") {
              const formattedFootnoteText = formatMarkdown(
                footnote,
                "secondary"
              );
              logger.color("white").log(formattedFootnoteText + "\n");
            }
          }
        }
      } else if (!response.error) {
        logger.color("yellow").bold().underscore().log(`No results\n`);
      } else if (response.error?.name) {
        logger.color("red").bold().underscore().log(`${response.error.name}\n`);
        logger.color("red").log(`${response.error.description || "--"}\n`);
      } else {
        logger.color("red").bold().log(`Invalid request\n`);
      }
    }
  });
