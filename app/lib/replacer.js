import fs from "fs";
import path from "path";
import parse from "csv-parse";
import flatten from "lodash/flatten";

const tableCache = {};

export function loadText(text, options = {}) {
  return new Promise(function (resolve, reject) {
    text = path.basename(text);

    if (tableCache[text])
      return resolve(tableCache[text]);

    let table = [];
    const input = fs.createReadStream(__dirname + "/../../database/texts/" + text + ".csv");
    const parser = parse({ columns: ["zh", "ja", "en"] });

    parser
      .on("readable", function () {
        let record = null;
        while ((record = parser.read()) !== null) {
          table.push(record);
        }
      })
      .on("error", reject)
      .on("finish", function () {
        if (options.caseInsensitive) {
          table = table.concat(table.map(row => ({...row, en: row.en.toLowerCase()})));
        }
        tableCache[text] = table;
        resolve(table);
      });

    input.on("error", reject)
      .pipe(parser);
  });
}

export default async function (source, options) {
  const sourceLng = options.sourceLng || "en";
  const resultLng = options.resultLng || "zh";
  let result = source || "";

  let tables = await Promise.all(options.texts.map(text => loadText(text, {
    caseInsensitive: text === "type"
  })));

  tables = flatten(tables);
  tables.sort((row1, row2) => (row2[sourceLng].length - row1[sourceLng].length));

  tables.forEach(row => {
    if (row[sourceLng] && row[resultLng]) {
      result = result.split(row[sourceLng]).join(row[resultLng]);
    }
  });

  return result;
}