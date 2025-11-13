const { Command } = require("commander");
const logger = require("node-color-log");
const { baseLog, formatMarkdown } = require("./utils");
const { default: WikiSubmission } = require("wikisubmission-sdk");

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
    } = options;

    const ws = WikiSubmission.createClient();
    const includeCommentary = !nocommentary;

    if (query === "rv" || query === "randomverse") {
      try {
        const response = await ws.Quran.randomVerse();

        if (response.error) {
          logger.color("red").bold().underscore().log(`Error fetching random verse\n`);
          logger.color("red").log(`${response.error.message || "Unknown error"}\n`);
          return;
        }

        if (!response.data) {
          logger.color("yellow").bold().underscore().log(`No verse found\n`);
          return;
        }

        const result = response.data;
        let verseContent = "";

        // Subtitles
        if (result.ws_quran_subtitles && includeCommentary) {
          const subtitleText =
            result.ws_quran_subtitles[
            language in result.ws_quran_subtitles
              ? language
              : "english"
            ];
          if (subtitleText) {
            verseContent += formatMarkdown(String(subtitleText), "magenta") + "\n\n";
          }
        }

        // Text
        const verseText = result.ws_quran_text[language] || result.ws_quran_text.english;
        verseContent += `[${result.verse_id}] ${formatMarkdown(verseText)}\n\n`;

        // Arabic
        if (arabic) {
          const arabicText = result.ws_quran_text.arabic;
          verseContent += `${arabicText}\n`;
        }

        // Transliteration
        if (transliteration) {
          const transliterationText = result.ws_quran_text.transliterated;
          if (transliterationText) {
            verseContent += `${transliterationText}\n`;
          }
        }

        // Footnotes
        if (result.ws_quran_footnotes && includeCommentary) {
          const footnoteText =
            result.ws_quran_footnotes[
            language in result.ws_quran_footnotes
              ? language
              : "english"
            ];
          if (footnoteText) {
            verseContent += formatMarkdown(String(footnoteText), "secondary") + "\n";
          }
        }

        logger
          .color("green")
          .bold()
          .underscore()
          .log("Random Verse\n");

        logger.color("white").log(verseContent.trim() + "\n");
      } catch (error) {
        logger.color("red").log(`API Error. Please try again later.`);
        logger.dim().log(`"${error.message}"\n`);
      }
      return;
    }

    if (query === "rc" || query === "randomchapter") {
      try {
        const response = await ws.supabase
          .from("ws_quran_index")
          .select(`*, 
         ws_quran_text!inner(*), 
         ws_quran_chapters!inner(*),
         ws_quran_subtitles(*),
         ws_quran_footnotes(*),
         ws_quran_word_by_word(*)`)
          .eq("chapter_number", Math.floor(Math.random() * 114) + 1);

        if (response.error) {
          logger.color("red").bold().underscore().log(`Error fetching random chapter\n`);
          logger.color("red").log(`${response.error.message || "Unknown error"}\n`);
          return;
        }

        if (!response.data) {
          logger.color("yellow").bold().underscore().log(`No chapter found\n`);
          return;
        }

        // Handle both array and single object responses
        const results = Array.isArray(response.data) ? response.data : [response.data];

        if (results.length === 0) {
          logger.color("yellow").bold().underscore().log(`No verses found\n`);
          return;
        }

        // Get chapter info from first verse
        const firstVerse = results[0];
        let chapterInfo = "";

        if (firstVerse.ws_quran_chapters) {
          const chapterTitle =
            firstVerse.ws_quran_chapters[`title_${language}`] ||
            firstVerse.ws_quran_chapters.title_english;
          chapterInfo = `Sura ${firstVerse.chapter_number}: ${chapterTitle} (${firstVerse.chapter_verses} verses)`;
        }

        logger
          .color("green")
          .bold()
          .underscore()
          .log("Random Chapter\n");

        if (chapterInfo) {
          logger.color("white").log(formatMarkdown(chapterInfo) + "\n");
        }

        // Process all verses
        for (const result of results) {
          let verseContent = "";

          // Subtitles
          if (result.ws_quran_subtitles && includeCommentary) {
            const subtitleText =
              result.ws_quran_subtitles[
              language in result.ws_quran_subtitles
                ? language
                : "english"
              ];
            if (subtitleText) {
              verseContent += formatMarkdown(String(subtitleText), "magenta") + "\n\n";
            }
          }

          // Text
          const verseText = result.ws_quran_text[language] || result.ws_quran_text.english;
          verseContent += `[${result.verse_id}] ${formatMarkdown(verseText)}\n\n`;

          // Arabic
          if (arabic) {
            const arabicText = result.ws_quran_text.arabic;
            verseContent += `${arabicText}\n\n`;
          }

          // Transliteration
          if (transliteration) {
            const transliterationText = result.ws_quran_text.transliterated;
            if (transliterationText) {
              verseContent += `${transliterationText}\n\n`;
            }
          }

          // Footnotes
          if (result.ws_quran_footnotes && includeCommentary) {
            const footnoteText =
              result.ws_quran_footnotes[
              language in result.ws_quran_footnotes
                ? language
                : "english"
              ];
            if (footnoteText) {
              verseContent += formatMarkdown(String(footnoteText), "secondary") + "\n\n";
            }
          }

          logger.color("white").log(verseContent.trim() + "\n");
        }
      } catch (error) {
        logger.color("red").log(`API Error. Please try again later.`);
        logger.dim().log(`"${error.message}"\n`);
      }
      return;
    }

    const results = await ws.Quran.query(query, {
      highlight: true,
      language: language,
      strategy: strict ? "strict" : "default",
      adjustments: {
        index: true,
        chapters: true,
        text: true,
        footnotes: includeCommentary,
        subtitles: includeCommentary,
        wordByWord: false,
      },
    });

    if (results.status === "success") {
      let verses = [];

      // Build verses array based on result type
      switch (results.type) {
        case "verse":
        case "multiple_verses":
        case "chapter": {
          for (const result of results.data) {
            let verseContent = "";

            // Subtitles
            if (result.ws_quran_subtitles && includeCommentary) {
              const subtitleText =
                result.ws_quran_subtitles[
                language in result.ws_quran_subtitles
                  ? language
                  : "english"
                ];
              if (subtitleText) {
                verseContent += formatMarkdown(String(subtitleText), "magenta") + "\n\n";
              }
            }

            // Text
            const verseText = result.ws_quran_text[language] || result.ws_quran_text.english;
            verseContent += `[${result.verse_id}] ${formatMarkdown(verseText)}\n\n`;

            // Arabic
            if (arabic) {
              const arabicText = result.ws_quran_text.arabic;
              verseContent += `${arabicText}\n\n`;
            }

            // Transliteration
            if (transliteration) {
              const transliterationText = result.ws_quran_text.arabic_transliteration;
              if (transliterationText) {
                verseContent += `${transliterationText}\n\n`;
              }
            }

            // Footnotes
            if (result.ws_quran_footnotes && includeCommentary) {
              const footnoteText =
                result.ws_quran_footnotes[
                language in result.ws_quran_footnotes
                  ? language
                  : "english"
                ];
              if (footnoteText) {
                verseContent += formatMarkdown(String(footnoteText), "secondary") + "\n\n";
              }
            }

            verses.push(verseContent.trim());
          }
          break;
        }

        case "search": {
          for (const result of results.data) {
            let verseContent = "";

            switch (result.hit) {
              case "text": {
                const textContent = result[language] || result.english;
                verseContent = `[${result.verse_id}] ${formatMarkdown(textContent)}`;
                break;
              }
              case "chapter": {
                const chapterTitle = result[`title_${language}`] || result.title_english;
                verseContent = `Chapter: Sura ${result.chapter_number}, ${chapterTitle}`;
                break;
              }
              case "subtitle": {
                const subtitleContent =
                  result[
                  language in result
                    ? language
                    : "english"
                  ];
                verseContent = `[${result.verse_id}] Subtitle: ${formatMarkdown(String(subtitleContent), "magenta")}`;
                break;
              }
              case "footnote": {
                const footnoteContent =
                  result[
                  language in result
                    ? language
                    : "english"
                  ];
                verseContent = `[${result.verse_id}] Footnote: ${formatMarkdown(String(footnoteContent), "secondary")}`;
                break;
              }
            }

            verses.push(verseContent);
          }
          break;
        }
      }

      // Log results
      if (verses.length > 0) {

        if (results.type === "search") {
          logger
            .color("green")
            .bold()
            .underscore()
            .log(
              `${results.metadata.formattedQuery} (${results.totalMatches} result${results.totalMatches > 1 ? "s" : ""})\n`
            );
        }

        logger
          .color("green")
          .bold()
          .underscore()
          .log(
            `${results.metadata.formattedChapterTitle}\n`
          );

        for (const verse of verses) {
          logger.color("white").log(verse + "\n");
        }
      } else {
        logger.color("yellow").bold().underscore().log(`No results\n`);
      }
    } else {
      logger.color("red").bold().underscore().log(`No results found with "${query}"\n`);
    }
  });
