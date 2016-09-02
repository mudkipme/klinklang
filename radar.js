import program from 'commander';
import { init } from './app/actions/init';

program
.command('init')
.description('Init the Pokédex database.')
.action(async function() {
  try {
    await init();
  } catch (e) {
    console.log(e);
  }
});

if (program.parse(process.argv).args.length === 0) {
  program.help();
}