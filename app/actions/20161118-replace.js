import fs from 'mz/fs';
import path from 'path';
import stringify from 'csv-stringify';
import pg from 'polygoat';
import parse from 'csv-parse';
import _ from 'lodash';

const tables = ['pokemon', 'move', 'item', 'ability'];
const ambiguous = ['怪力', '毒针', '毒針', '恶梦', '惡夢', '忍耐', '报仇', '報仇', '怨恨', '懒惰', '报复', '毒刺', '对焦镜片', '對焦鏡片', '毒针', '毒針', '杂技', '看穿', '魔法反射', '协助', '協助', '储存', '儲存', '石头', '石頭', '天气预报', '天氣預報', '乐天', '樂天'];

function readTable(name) {
  return new Promise((resolve, reject) => {
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

function readMove() {
  return new Promise((resolve, reject) => {
    const result = [];
    const input = fs.createReadStream(__dirname + '/../../database/movements.csv');
    const parser = parse({ columns: ['from', 'to'] });

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

function hasAmbiguous(text) {
  return ambiguous.some(str => text.indexOf(str) !== -1);
}

async function checkTable(name) {
  const result = await readTable(name);
  return result.filter(record => {
    return record['zh-hans-current'] !== record['zh-hans'] || record['zh-hant-current'] !== record['zh-hant'];
  });
}

async function replaceRules() {
  let names = await Promise.all(tables.map(name => readTable(name)));
  const glossary = [];

  names.forEach((records, index) => {
    records.forEach(record => {
      const hansFrom = record['zh-hans-legacy'];
      const hantFrom = record['zh-hant-legacy'];

      glossary.push({ from: record['zh-hans'], to: record['zh-hans'], table: tables[index], type: 'zh-hans' });
      if (record['zh-hans'] !== record['zh-hant']) {
        glossary.push({ from: record['zh-hant'], to: record['zh-hant'], table: tables[index], type: 'zh-hant' });
      }

      if (hansFrom !== record['zh-hans'] && !hasAmbiguous(hansFrom) && record['zh-hans'].indexOf(hansFrom) === -1) {
        glossary.push({ from: hansFrom, to: record['zh-hans'], table: tables[index], type: 'zh-hans' });
        glossary.push({ from: `cn|${hansFrom}`, to: `cn|${hansFrom}`, table: tables[index], type: 'zh-hans' });
        glossary.push({ from: `tw|${hansFrom}`, to: `tw|${hansFrom}`, table: tables[index], type: 'zh-hans' });
        glossary.push({ from: `hk|${hansFrom}`, to: `hk|${hansFrom}`, table: tables[index], type: 'zh-hans' });
      }
      if (hantFrom !== record['zh-hant'] && hansFrom !== hantFrom && !hasAmbiguous(hantFrom) && record['zh-hant'].indexOf(hantFrom) === -1) {
        glossary.push({ from: hantFrom, to: record['zh-hant'], table: tables[index], type: 'zh-hant' });
        glossary.push({ from: `cn|${hantFrom}`, to: `cn|${hantFrom}`, table: tables[index], type: 'zh-hant' });
        glossary.push({ from: `tw|${hantFrom}`, to: `tw|${hantFrom}`, table: tables[index], type: 'zh-hant' });
        glossary.push({ from: `hk|${hantFrom}`, to: `hk|${hantFrom}`, table: tables[index], type: 'zh-hant' });
      }
    });
  });

  return glossary;
}

async function allReplaceRules() {
  const rules = await replaceRules();
  const movements = await readMove();
  const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
  
  movements.forEach(movement => {
    if (!hasAmbiguous(movement.from)) {
      rules.push(movement);
    }
  });

  allpages.forEach(page => {
    if (isNaN(page.title - parseFloat(page.title))) {
      rules.push({ from: page.title, to: page.title });
    }
  });

  return rules;
}

function createReplace(originalRules) {
  const rules = originalRules.sort((rule1, rule2) => {
    return rule2.from.length - rule1.from.length;
  });

  return text => {
    rules.forEach((rule, index) => {
      text = text.split(rule.from).join(`!@#%${index}%#@!`);
    });
    rules.forEach((rule, index) => {
      text = text.split(`!@#%${index}%#@!`).join(rule.to);
    });
    return text;
  };
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
      console.log(rules.filter(rule => rule.from !== rule.to).map(JSON.stringify).join('\n'));
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('movements')
  .description('导出需要移动的条目。')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      const rules = await replaceRules();
      const replace = createReplace(rules);
      const moves = [];
      for (let page of allpages) {
        const rt = replace(page.title);
        if (rt !== page.title) {
          moves.push({ from: page.title, to: rt });
          console.log(`Move ${page.title} to ${rt}.`);
        }
      }
      const result = await pg(stringify.bind(null, moves, {
        columns: ['from', 'to']
      }));

      await fs.writeFile(path.join(__dirname, '../../database/movements.csv'), result);
      console.log('Saved movements.');
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('do-move')
  .description('移动 movements.csv 中的条目。')
  .action(async () => {
    try {
      const movements = await readMove();
      for (let movement of movements) {
        if (movement.from === movement.to) {
          continue;
        }
        try {
          let options = {};
          if (movement.from.indexOf('Category:') === 0) {
            options = { noredirect: true };
          }
          const result = await wiki.move(movement.from, movement.to, options);
          console.log(result);
        } catch (e) {
          console.log(e);
        }
      }
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('ambiguous')
  .description('寻找歧义的词语。')
  .action(async () => {
    try {
      let names = _.flatten(await Promise.all(tables.map(name => readTable(name))));
      names.forEach(record => {
        if (names.some(another => {
          return record !== another && (
            record['zh-hans-legacy'] === another['zh-hans-legacy']
            || record['zh-hans-legacy'] === another['zh-hant-legacy']
            || record['zh-hans-legacy'] === another['zh-hans']
            || record['zh-hans-legacy'] === another['zh-hant']
            || record['zh-hant-legacy'] === another['zh-hans-legacy']
            || record['zh-hant-legacy'] === another['zh-hant-legacy']
            || record['zh-hans-legacy'] === another['zh-hans']
            || record['zh-hans-legacy'] === another['zh-hant']
            );
        })) {
          console.log(record);
        }
      });
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('replace-all')
  .description('替换所有条目。')
  .action(async () => {
    try {
      const rules = await allReplaceRules();
      const replace = createReplace(rules);
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      for (let page of allpages) {
        if (![0, 4, 10, 14].includes(page.ns)) {
          continue;
        }

        console.log(`Reading ${page.title}`);
        const content = await wiki.getContent(page.title);
        const replacement = replace(content);
        if (replacement === content) {
          continue;
        }
        console.log(`Writing ${page.title}`);
        const response = await wiki.edit(page.title, replacement, { summary: 'Batch replace for Sun/Moon release.' });
        console.log(response);
      }

    } catch (e) {
      console.log(e);
    }
  });
}