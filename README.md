# wikisubmission-cli

Access WikiSubmission commands through your terminal.

## Requirements

Ensure [Node.js](https://nodejs.org/en/download/prebuilt-installer) is installed on your computer.

Run the following command in your terminal / command prompt to install the CLI:

```zsh
npm install wikisubmission-cli -g
```

## Usage

Base command: `ws` or `wikisubmission`

### Quran

Querying the Quran is the default command, e.g, `ws 1:1` will load the verse "1:1". Other examples:

* Load verse range: `ws 2:27-32`
* Load multiple verses: `ws 2:4, 8:17, 74:30`
* Search text: `ws god alone`
* Random verse: `ws rv`
* Random chapter: `ws rc`

![Example](https://i.imgur.com/AoPGLQw.png)
![Example](https://i.imgur.com/Wifimu9.png)

Optional parameters:

* Swap English language: `-lan <string>` or `--language <string>` (supported: turkish, french, swedish, russian, bahasa, tamil, persian)
* Include Arabic text: `-ar` or `--arabic`
* Include Arabic-to-English transliteration: `-tr` or `--transliteration`
* Do not include subtitles or footnotes: `-nc` or `--nocommentary`
* Strict search (ensure identical word order): `-s` or `--strict`

### Prayer Times

Get live prayer times for any location. The command prefix is `pt` or `prayertimes`. Examples:

* `ws pt new york`
* `ws pt eiffel tower`
* `ws pt 40 N 120 S Salt Lake City`
* `ws pt "51.5072178, -0.1275862"`

![Example](https://i.imgur.com/23mK5Rv.png)

### Media

Query media resources from Dr. Rashad Khalifa. The command prefix is `m` or `media`. Examples:

* `ws m angels`
* `ws m chapter 2`

![Example](https://i.imgur.com/oUAtwwJ.png)

Optional parameters:

* Strict search (ensure identical word order): `-s` or `--strict`
* Specific media category: `-e` or `--extent` (followed by 'sermons', 'programs', or 'audios')

### Newsletters

Query newsletter references from the Submitters Perspectives. The command prefix is `n` or `newsletters` or `sp`. Examples:

* `ws n 1974`
* `ws n discovery`

![Example](https://i.imgur.com/1vbgJxz.png)

Optional parameters:

* Strict search (ensure identical word order): `-s` or `--strict`