import program from 'commander';
import cookieStore from 'tough-cookie-file-store';
import request from 'request';
import fs from 'mz/fs';
import path from 'path';
import Wiki52Poke from './app/lib/wiki52poke';
import { init } from './app/actions/init';

// actions for temporary tasks
import action20161118Replace from './app/actions/20161118-replace';

const version = require('./package.json').version;
const config = require('./config.json');
const jar = request.jar(new cookieStore('./database/cookie.json'));
const wiki = new Wiki52Poke({
  api: config.wiki.api,
  userAgent: `MudkipRadar v${version}`,
  jar: jar
});

program
.command('init')
.description('Init the Pokédex database.')
.action(async () => {
  try {
    await init();
  } catch (e) {
    console.log(e);
  }
});

program
.command('login [username] [password]')
.description('Login into the wiki.')
.action(async (username, password) => {
  try {
    const result = await wiki.login(username || config.wiki.username, password || config.wiki.password);
    console.log('User ' + result.username + ' logined.');
  } catch (e) {
    console.log(e);
  }
});

program
.command('whoami')
.description('Get the information of current user.')
.action(async () => {
  try {
    const result = await wiki.whoami();
    console.log(result);
  } catch (e) {
    console.log(e);
  }
});

program
.command('allpages')
.description('Save the titles of all pages in 52Poké Wiki.')
.action(async () => {
  try {
    let pages = [], result = null, next = {};
    for (let namespace of [0, 4, 6, 10, 14]) {
      do {
        result = await wiki.allpages({
          ...next,
          aplimit: 5000,
          apfilterredir: 'nonredirects',
          apnamespace: namespace });
        pages = pages.concat(result.pages);
        next = result.next;
        console.log(`Fetched ${pages.length} results in namespace ${namespace}.`);
      } while (next && next.apcontinue);
    }

    await fs.writeFile(path.join(__dirname, './database/allpages.json'), JSON.stringify(pages));
    console.log('Saved all pages.');
  } catch(e) {
    console.log(e);
  }
});

action20161118Replace(program, wiki);

program.version(version);

if (program.parse(process.argv).args.length === 0) {
  program.help();
}