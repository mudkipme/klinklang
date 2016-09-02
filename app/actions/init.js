import fs from 'mz/fs';
import path from 'path';
import parse from 'csv-parse';
import camelCase from 'camelcase';
import db from '../lib/database';

const csvRootDir = path.join(__dirname, '../../pokedex/pokedex/data/csv');

function importTable(tableName) {
  return new Promise((resolve, reject) => {
    let insertStmt = null;
    const input = fs.createReadStream(path.join(csvRootDir, tableName + '.csv'));
    const parser = parse();
    let index = 0;

    tableName = camelCase(tableName);

    const readRecord = (data) => {
      db.serialize(() => {
        if (index === 0) {
          db.run('BEGIN TRANSACTION');
          db.run(`DROP TABLE IF EXISTS ${tableName}`);
          const columns = data.map(item => camelCase(item)); 
          db.run(`CREATE TABLE ${tableName} (${columns.map(item => '`' + item + '`')})`);
          insertStmt = db.prepare(`INSERT INTO ${tableName} VALUES (${Array(columns.length).fill('?').join(',')})`);
          return;
        }

        data = data.map(item => item !== '' ? (isNaN(parseFloat(item)) ? item : Number(item)) : null);
        insertStmt.run.apply(insertStmt, data);
      });
    };

    parser.on('readable', () => {
      let record = null;
      while (record = parser.read()) {
        readRecord(record);
        index += 1;
      }
    })
    .on('error', err => reject(err))
    .on('finish', () => {
      db.serialize(() => {
        insertStmt.finalize();
        db.run('COMMIT', (err) => {
          if (err) {
            reject(err);
            return;
          }

          console.log(`Imported table ${tableName}`);
          resolve(null);
        });
      });
    });

    input.pipe(parser);
  });
}

export async function init() {
  let files = await fs.readdir(csvRootDir);
  files = files.filter(filename => /\.csv$/i.test(filename));
  for (let file of files) {
    await importTable(path.basename(file, '.csv'));
  }
}