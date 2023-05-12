#!/usr/bin/env node
import fs from 'fs';
import { createInterface } from 'readline';

async function loadBigJsonArray(path: string) {
  console.log(`start reading ${path}`);
  const result: any[] = [];
  const readline = createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity,
  });
  let count = 0;
  for await (let line of readline) {
    count++;
    if (count % 100000 === 1) console.log('rows: ', count);
    line = line.trim();
    if (line) {
      if (line.endsWith(','))
        line = line.slice(0, line.length - 1);
      const row = JSON.parse(line);
      result.push(row);
    }
  }
  console.log('file read complete');
  return result;
}

async function main() {
  const list = await loadBigJsonArray('./data//ethusdt-1683364860372.json');
  console.log(list.length);
}

main();
