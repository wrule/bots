import fs from 'fs';
import { createInterface } from 'readline';

export
async function LoadBigJsonArray<T>(
  path: string,
  mapper: (row: any) => T = (row: any) => row,
) {
  const result: T[] = [];
  const readline = createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity,
  });
  console.log(`start reading ${path}`);
  let count = 0;
  for await (let line of readline) {
    count++;
    if (count % 100000 === 1) console.log('rows: ', count);
    line = line.trim();
    if (line) {
      if (line.endsWith(','))
        line = line.slice(0, line.length - 1);
      try {
        const row = mapper(JSON.parse(line));
        result.push(row);
      } catch (e) {
        console.log(e);
      }
    }
  }
  console.log('rows: ', result.length);
  console.log('file read complete');
  return result;
}
