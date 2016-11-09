import fs from 'mz/fs';
import path from 'path';
import stringify from 'csv-stringify';
import pg from 'polygoat';
import parse from 'csv-parse';

const tables = ['pokemon', 'move', 'item', 'ability'];
const suffixes = {
  pokemon: { 'zh-hans': '', 'zh-hant': '' },
  move: { 'zh-hans': '（招式）', 'zh-hant': '（招式）' },
  item: { 'zh-hans': '（道具）', 'zh-hant': '（道具）' },
  ability: { 'zh-hans': '（特性）', 'zh-hant': '（特性）' }
};
const exceptions = ['3D龍事件'];

function readTable(name) {
  return new Promise(function (resolve, reject) {
    const result = [];
    const input = fs.createReadStream(__dirname + '/../../database/20161118/' + path.basename(name) + '.csv');
    const parser = parse({ columns: ['ja', 'en', 'zh-hans', 'zh-hant', 'zh-hans-legacy', 'zh-hant-legacy', 'zh-hans-current', 'zh-hant-current'] });

    parser.on('readable', function () {
      let record = null;
      while (record = parser.read()) {
        result.push(record);
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

async function checkTable(name) {
  const result = await readTable(name);
  return result.filter(record => {
    return record['zh-hans-current'] !== record['zh-hans'] || record['zh-hant-current'] !== record['zh-hant'];
  });
}

async function replaceRules(legacy = false) {
  const names = await Promise.all(tables.map(name => readTable(name)));
  const rules = [];
  names.forEach((records, index) => {
    records.forEach(record => {
      const hansFrom = record[legacy ? 'zh-hans-legacy' : 'zh-hans-current'];
      const hantFrom = record[legacy ? 'zh-hant-legacy' : 'zh-hant-current'];
      if (hansFrom !== record['zh-hans']) {
        rules.push({ from: hansFrom, to: record['zh-hans'], table: tables[index], type: 'zh-hans' });
      }
      if (hantFrom !== record['zh-hant'] && hantFrom !== hansFrom) {
        rules.push({ from: hantFrom, to: record['zh-hant'], table: tables[index], type: 'zh-hant' });
      }
    });
  });
  return rules;
}

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
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
  .description('检查需要替换的译名。（pokemon、move、item、ability）')
  .action(async (name) => {
    try {
      const differences = await checkTable(name);
      console.log(differences.map(JSON.stringify).join('\n'));
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('check-replace-all')
  .description('检查所有替换规则。')
  .action(async () => {
    try {
      const rules = await replaceRules();
      console.log(rules.map(JSON.stringify).join('\n'));
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('do-move')
  .description('移动需要替换的条目。')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      const rules = await replaceRules();
      rules.sort((rule1, rule2) => {
        return rule2.from.length - rule1.from.length;
      });
      const replace = text => {
        for (let rule of rules) {
          text = text.split(rule.from).join(rule.to);
        }
        return text;
      };
      for (let page of allpages) {
        if (exceptions.includes(page.title)) {
          continue;
        }
        const rt = replace(page.title);
        if (rt !== page.title) {
          console.log(`Move ${page.title} to ${rt}.`);
          try {
            const result = await wiki.move(page.title, rt, { reason: 'Batch moving for Sun/Moon release.' });
            console.log(result);
          } catch(e) {
            console.log(e);
          }
        }
      }
    } catch(e) {
      console.log(e);
    }
  });
}