#!/usr/bin/env node
import fs from 'fs';
import { createInterface } from 'readline';

async function loadBigJsonArray(path: string) {
  const result: any[] = [];
  const readline = createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity,
  });
  for await (let line of readline) {
    line = line.trim();
    if (line) {
      if (line.endsWith(','))
        line = line.slice(0, line.length - 1);
      const row = JSON.parse(line);
      result.push(row);
    }
  }
  console.log('文件读取完毕');
  return result;
}

async function main() {
  const list = await loadBigJsonArray('./data//ethusdt-1683364860372.json');
  console.log(list.length);
}

main();
