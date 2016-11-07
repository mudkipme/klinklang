import fs from 'mz/fs';
import path from 'path';
import stringify from 'csv-stringify';
import pg from 'polygoat';
import parse from 'csv-parse';

export function checkTable(name, options = {}) {
  return new Promise(function (resolve, reject) {
    const result = [];
    const input = fs.createReadStream(__dirname + '/../../database/20161118/' + path.basename(name) + '.csv');
    const parser = parse({ columns: ['ja', 'en', 'zh-hans', 'zh-hant', 'zh-hans-legacy', 'zh-hant-legacy', 'zh-hans-current', 'zh-hant-current'] });

    parser.on('readable', function () {
      let record = null;
      while (record = parser.read()) {
        if (record['zh-hans-current'] !== record['zh-hans'] || record['zh-hant-current'] !== record['zh-hant']) {
          result.push(record);
        }
      }
    })
    .on('error', reject)
    .on('finish', function () {
      resolve(result);
    });

    input.on('error', reject)
    .pipe(parser);
  });
}

export default function (program, wiki) {
  program
  .command('pages-with-pokemon')
  .description('所有包含“神奇宝贝”的条目名。')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      const input = allpages.filter(page => page.title.match(/(神奇宝贝|神奇寶貝)/));
      const result = await pg(stringify.bind(null, input, {
        columns: ['pageid', 'ns', 'title']
      }));

      console.log(result);
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('check-table <name>')
  .description('检查需要替换的译名（pokemon、move、item、ability）')
  .action(async (name) => {
    try {
      const differences = await checkTable(name);
      console.log(differences.map(JSON.stringify).join('\n'));
    } catch(e) {
      console.log(e);
    }
  });
}