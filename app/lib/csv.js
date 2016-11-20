import fs from 'mz/fs';
import parse from 'csv-parse';

export function parseCSV(filename, columns) {
  return new Promise((resolve, reject) => {
    const result = [];
    const input = fs.createReadStream(filename);
    const parser = parse({ columns });

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