const fs = require("fs")
const regex = /ui\.localize\((['"`])([\s\S]*?)\1/gm;
const regex2 = /l10n\.t\((['"`])([\s\S]*?)\1/gm;

const str = fs.readFileSync("./out/bundle.js")

const zh = fs.readFileSync("./l10n/bundle.l10n.zh-cn.json")
const zhl = JSON.parse(zh)

let m;
let ret = new Map()
while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        if (groupIndex == 2) {
            ret[match] = match
            console.log(`Found match, group ${groupIndex}: ${match}`);
        }
    });
}

while ((m = regex2.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex2.lastIndex) {
        regex2.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        if (groupIndex == 2) {
            ret[match] = match
            console.log(`Found l10n key: ${match}`);
        }
    });
}

for (const key in ret) {
    if (zhl[key]) {
        ret[key] = zhl[key]
    }
}

fs.writeFileSync("./1.json", JSON.stringify(ret, null, 2))