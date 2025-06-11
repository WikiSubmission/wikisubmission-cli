const logger = require("node-color-log");

exports.baseLog = function () {
  logger.dim().log("\n------------------");
  logger.bold().log(`WikiSubmission CLI`);
  logger.log("Type `ws` for a list of commands");
  logger.dim().log("------------------\n");
};

exports.formatMarkdown = (text, mode = "default") => {
  const regex = /\*\*(.*?)\*\*/g; // Match **...**

  const yellow = "\x1b[33m";
  const white = "\x1b[37m";
  const grayish = "\x1b[90m";
  const magenta = "\x1b[35m";

  let defaultColor;
  switch (mode) {
    case "secondary":
      defaultColor = grayish;
      break;
    case "magenta":
      defaultColor = magenta;
      break;
    default:
      defaultColor = white;
  }

  return text
    .replace(regex, (match, p1) => {
      return `${yellow}${p1}${defaultColor}`;
    })
    .replace(/^/, defaultColor);
};
