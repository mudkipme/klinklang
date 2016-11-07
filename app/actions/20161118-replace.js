import fs from 'mz/fs';
import path from 'path';
import stringify from 'csv-stringify';
import pg from 'polygoat';

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
}