import program from 'commander';
import cookieStore from 'tough-cookie-file-store';
import request from 'request';
import MWClient from './app/lib/mwclient';
import { init } from './app/actions/init';

const version = require('./package.json').version;
const config = require('./config.json');
const jar = request.jar(new cookieStore('./database/cookie.json'));
const wiki = new MWClient({
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

program.version(version);

if (program.parse(process.argv).args.length === 0) {
  program.help();
}