const fs = require('fs')

if (process.argv.length < 3) {
  console.log(`Usage: node x.js <lang>`)
  process.exit(1)
}

const lang = process.argv[2]

             const regexUI = /ui\.localize\((['"`])([\s\S]*?)\1/gm;
const regex2L10n = /l10n\.t\((['"`])([\s\S]*?)\1/gm;
const codeStr = fs.readFileSync('./out/bundle.js')

let lang_file = '{}'
if (fs.existsSync(`./l10n/bundle.l10n.${lang}.json`)) {
  lang_file =
      fs.readFileSync(`./l10n/bundle.l10n.${lang}.json`, {encoding: 'utf8'});
}
const oldLangMap = JSON.parse(lang_file.replace('\\', '\\\\'))

let newLangMap = new Map()

function fillMap(regex, map) {
  while ((m = regex.exec(codeStr)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (groupIndex == 2) {
        map[match] = match
      }
    });
  }
}

// found all l10n key use `ui.localize`
fillMap(regexUI, newLangMap)
// found all l10n key use `t.l10n`
fillMap(regex2L10n, newLangMap)

// merge with existing l10n file
for (const key in newLangMap) {
  if (oldLangMap[key])
    newLangMap[key] = oldLangMap[key]
}

fs.writeFileSync(`./l10n/bundle.l10n.${lang}.json`,
                 JSON.stringify(newLangMap, null, 2).replace('\\\\', '\\'),
                 {encoding: 'utf8'})

console.log(`Updated l10n file for lang: ${lang}`)