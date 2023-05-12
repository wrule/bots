#!/usr/bin/env node
import fs from 'fs';
import { createInterface } from 'readline';

async function LoadBigJsonArray(path: string) {
  const result: any[] = [];
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
        const row = JSON.parse(line);
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

async function main() {
  const list = await LoadBigJsonArray('./data//ethusdt-1683364860372.json');
  console.log(list.length);
}

main();
