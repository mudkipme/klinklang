import fs from 'mz/fs';
import path from 'path';
import { promisify } from 'util';
import stringify from 'csv-stringify';
import { parseCSV } from '../lib/csv';
import _ from 'lodash';

const tables = ['pokemon', 'move', 'item', 'ability'];
const ambiguous = ['怪力', '毒针', '毒針', '恶梦', '惡夢', '忍耐', '报仇', '報仇', '怨恨', '懒惰', '报复', '毒刺', '对焦镜片', '對焦鏡片', '毒针', '毒針', '杂技', '看穿', '魔法反射', '协助', '協助', '储存', '儲存', '石头', '石頭', '天气预报', '天氣預報', '乐天', '樂天'];
const suffixes = {
  ability: '（特性）',
  item: '（道具）',
  move: '（招式）',
  pokemon: ''
};

function readTable(name) {
  return parseCSV(__dirname + '/../../database/20161118/' + path.basename(name) + '.csv', ['ja', 'en', 'zh-hans', 'zh-hant', 'zh-hans-legacy', 'zh-hant-legacy', 'zh-hans-current', 'zh-hant-current']);
}

function readMove() {
  return parseCSV(__dirname + '/../../database/movements.csv', ['from', 'to']);
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
      const result = await promisify(stringify)(input, {
        columns: ['pageid', 'ns', 'title']
      });

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
      const result = await promisify(stringify)(moves, {
        columns: ['from', 'to']
      });

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
        if (page.title < 'XY139') {
          continue;
        }

        console.log(`Reading ${page.title}`);
        try {
          const content = await wiki.getContent(page.title);
          const replacement = replace(content);
          if (replacement === content) {
            continue;
          }

          console.log(`Writing ${page.title}`);
          const response = await wiki.edit(page.title, replacement, { summary: 'Batch replace for Sun/Moon release.' });
          console.log(response);
        } catch(e) {
          console.log(e);
        }
      }

    } catch (e) {
      console.log(e);
    }
  });

  program
  .command('copy-to-pre')
  .description('把条目复制到 Pre: 名字空间')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      let names = await Promise.all(tables.map(name => readTable(name)));

      for (let index = 0; index < names.length; index++) {
        const records = names[index];
        for (let record of records) {
          const hansTitle = record['zh-hans'] + suffixes[tables[index]];
          const hantTitle = record['zh-hant'] + suffixes[tables[index]];
          if (allpages.some(page => page.title === hansTitle)) {
            console.log(`Reading ${hansTitle}`);
            const content = await wiki.getContent(hansTitle);
            console.log(`Writing Pre:${hansTitle}`);
            const response = await wiki.edit('Pre:' + hansTitle, content, { summary: 'Copy to Pre-Release namespace.' });
            console.log(response);
          } else if (allpages.some(page => page.title === hantTitle)) {
            console.log(`Reading ${hantTitle}`);
            const content = await wiki.getContent(hantTitle);
            console.log(`Writing Pre:${hantTitle}`);
            const response = await wiki.edit('Pre:' + hantTitle, content, { summary: 'Copy to Pre-Release namespace.' });
            console.log(response);
          }
        }
      }
      
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('move-description')
  .description('更新招式说明模板')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      const moves = await parseCSV(path.join(__dirname, '../../database/20161118/move-description.csv'), ['zh-hans', 'zh-hant', 'desc-hans', 'desc-hant', 'desc-trans']);
      const regex = /\|([^\|}]+)}}/;
      for (let move of moves) {
        let title = '';
        if (allpages.some(page => page.title === `Template:${move['zh-hans']}`)) {
          title = `Template:${move['zh-hans']}`;
        } else if (allpages.some(page => page.title === `Template:${move['zh-hant']}`)) {
          title = `Template:${move['zh-hant']}`;
        } else {
          console.log(`${move['zh-hans']} not found.`);
          continue;
        }

        let replacement = move['desc-hans'];
        if (move['desc-trans'] !== move['desc-hant']) {
          replacement = `-{zh-hans:${move['desc-hans']};zh-hant:${move['desc-hant']}}-`;
        }

        try {
          console.log(`Reading ${title}`);
          let content = await wiki.getContent(title);
          if (content.match(regex)) {
            content = content.replace(regex, text => {
              return `|${replacement}}}`;
            });
          } else {
            content = `${replacement}<noinclude>[[Category:招式说明]]</noinclude>`;
          }
          console.log(`Writing ${title}`);
          const response = await wiki.edit(title, content, { summary: 'Edit move description from Sun/Moon.' });
          console.log(response);
        } catch (e) {
          console.log(e);
        }
      }
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('item-description')
  .description('更新道具说明')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      const items = await parseCSV(path.join(__dirname, '../../database/20161118/item-description.csv'), ['zh-hans', 'zh-hant', 'desc-hans', 'desc-hant', 'desc-trans']);

      for (let item of items) {
        let title = '';
        if (allpages.some(page => page.title === item['zh-hans'] + suffixes.item)) {
          title = item['zh-hans'] + suffixes.item;
        } else if (allpages.some(page => page.title === item['zh-hant'] + suffixes.item)) {
          title = item['zh-hant'] + suffixes.item;
        } else {
          console.log(`${item['zh-hans']} not found.`);
          continue;
        }

        let description = item['desc-hans'];
        if (item['desc-trans'] !== item['desc-hant']) {
          description = `-{zh-hans:${item['desc-hans']};zh-hant:${item['desc-hant']}}-`;
        }

        try {
          console.log(`Reading ${title}`);
          let content = await wiki.getContent(title);

          content = content.replace(/\|info=([^\|\r\n]*)/, `|info=${description}`);
          if (content.indexOf('{{包包信息框|7|SM|') > -1) {
            content = content.replace(/{{包包信息框\|7\|SM\|([^\|}]*)\|([^\|}]*)\|([^\|}]*)}}/, `{{包包信息框|7|SM|$1|$2|${description}}}`);
          } else {
            content = content.replace(/{{包包信息框\|6\|ORAS\|([^\|}]*)\|([^\|}]*)\|([^\|}]*)}}/, `{{包包信息框|6|ORAS|$1|$2|$3}}\n{{包包信息框|7|SM|$1|$2|${description}}}`);
          }

          console.log(`Writing ${title}`);
          const response = await wiki.edit(title, content, { summary: 'Edit item description from Sun/Moon.' });
          console.log(response);
        } catch (e) {
          console.log(e);
        }
      }
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('ability-description')
  .description('更新特性说明')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      const abilities = await parseCSV(path.join(__dirname, '../../database/20161118/ability-description.csv'), ['zh-hans', 'zh-hant', 'desc-hans', 'desc-hant', 'desc-trans']);

      for (let ability of abilities) {
        let title = '';
        if (allpages.some(page => page.title === ability['zh-hans'] + suffixes.ability)) {
          title = ability['zh-hans'] + suffixes.ability;
        } else if (allpages.some(page => page.title === ability['zh-hant'] + suffixes.ability)) {
          title = ability['zh-hant'] + suffixes.ability;
        } else {
          console.log(`${ability['zh-hans']} not found.`);
          continue;
        }

        let description = ability['desc-hans'];
        if (ability['desc-trans'] !== ability['desc-hant']) {
          description = `-{zh-hans:${ability['desc-hans']};zh-hant:${ability['desc-hant']}}-`;
        }

        try {
          console.log(`Reading ${title}`);
          let content = await wiki.getContent(title);
          content = content.replace(/\|text=([^\r\n]*)/, `|text=${description}`);
          console.log(`Writing ${title}`);
          const response = await wiki.edit(title, content, { summary: 'Edit ability description from Sun/Moon.' });
          console.log(response);
        } catch (e) {
          console.log(e);
        }
      }
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('pokedex')
  .description('更新宝可梦图鉴')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      const pokedex = await parseCSV(path.join(__dirname, '../../database/20161118/pokedex.csv'), ['zh-hans', 'zh-hant', 'species-hans', 'species-hant', 'species-trans', 'sun-hans', 'sun-hant', 'sun-trans', 'moon-hans', 'moon-hant', 'moon-trans']);

      for (let species of pokedex) {
        if (!species['sun-hans']) {
          continue;
        }

        let title = '';
        if (allpages.some(page => page.title === species['zh-hans'])) {
          title = species['zh-hans'];
        } else if (allpages.some(page => page.title === species['zh-hant'])) {
          title = species['zh-hant'];
        } else {
          console.log(`${species['zh-hans']} not found.`);
          continue;
        }

        let sundex = species['sun-hans'];
        if (species['sun-trans'] !== species['sun-hant']) {
          sundex = `-{zh-hans:${species['sun-hans']};zh-hant:${species['sun-hant']}}-`;
        }

        let moondex = species['moon-hans'];
        if (species['moon-trans'] !== species['moon-hant']) {
          moondex = `-{zh-hans:${species['moon-hans']};zh-hant:${species['moon-hant']}}-`;
        }

        try {
          console.log(`Reading ${title}`);
          let content = await wiki.getContent(title);
          let originalContent = content;

          if (content.indexOf('|moondex=') > -1) {
            content = content.replace(/\|moondex=([^\r\n]*)/, `|moondex=${moondex}`);
          } else {
            content = content.replace(/\|(\w+)dex=([^\r\n]*)\n}}/, `|$1dex=$2\n|moondex=${moondex}\n}}`);
          }

          if (content.indexOf('|sundex=') > -1) {
            content = content.replace(/\|sundex=([^\r\n]*)/, `|sundex=${sundex}`);
          } else {
            content = content.replace(/\|moondex=([^\r\n]*)/, `|sundex=${sundex}\n|moondex=$1`);
          }

          if (originalContent === content) {
            continue;
          }
          
          console.log(`Writing ${title}`);
          const response = await wiki.edit(title, content, { summary: 'Edit Sun/Moon Pokédex.' });
          console.log(response);
        } catch (e) {
          console.log(e);
        }
      }
    } catch(e) {
      console.log(e);
    }
  });

  program
  .command('fix-broken-redirects')
  .description('修复受损重定向')
  .action(async () => {
    try {
      let names = await Promise.all(tables.map(name => readTable(name)));
      let brokenredirects = await parseCSV(path.join(__dirname, '../../database/20161118/brokenredirects.csv'), ['page', 'linkto']);
      for (let redirect of brokenredirects) {
        if (hasAmbiguous(redirect.linkto)) {
          continue;
        }
        let tableName = 'pokemon';
        _.each(suffixes, (suffix, table) => {
          if (suffix && redirect.linkto.endsWith(suffix)) {
            tableName = table;
          }
        });
        let records = names[tables.indexOf(tableName)];
        let replaceto = null;
        for (let record of records) {
          const original = _.trimEnd(redirect.linkto, suffixes[tableName]);
          if (original === record['zh-hans-legacy'] || original === record['zh-hans-current']) {
            replaceto = `${record['zh-hans']}${suffixes[tableName]}`;
            break;
          }

          if (original === record['zh-hant-legacy'] || original === record['zh-hant-current']) {
            replaceto = `${record['zh-hant']}${suffixes[tableName]}`;
            break;
          }
        }

        if (replaceto) {
          try {
            console.log(`Writing ${redirect.page}`);
            const response = await wiki.edit(redirect.page, `#REDIRECT [[${replaceto}]]`, { summary: 'Fix broken redirects.' });
            console.log(response);
          } catch (e) {
            console.log(e);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  });

  program
  .command('delete-pre')
  .description('删除 Pre: 名字空间条目')
  .action(async () => {
    try {
      const allpages = JSON.parse(await fs.readFile(path.join(__dirname, '../../database/allpages.json')));
      let names = await Promise.all(tables.map(name => readTable(name)));

      for (let index = 0; index < names.length; index++) {
        const records = names[index];
        for (let record of records) {
          try {
            const hansTitle = record['zh-hans'] + suffixes[tables[index]];
            const hantTitle = record['zh-hant'] + suffixes[tables[index]];
            if (allpages.some(page => page.title === hansTitle)) {
              console.log(`Deleting Pre:${hansTitle}`);
              const response = await wiki.remove('Pre:' + hansTitle, { reason: 'Delete from Pre-Release namespace.' });
              console.log(response);
            } else if (allpages.some(page => page.title === hantTitle)) {
              console.log(`Deleting Pre:${hantTitle}`);
              const response = await wiki.remove('Pre:' + hantTitle, { reason: 'Delete from Pre-Release namespace.' });
              console.log(response);
            }
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