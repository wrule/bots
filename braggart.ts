#!/usr/bin/env node
import fs from 'fs';
import { createInterface } from 'readline';
import { SpotSimpleTest } from 'litebot';

interface AB {
  time: number;
  ask: number;
  ask_volume: number;
  bid: number;
  bid_volume: number;
}

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

function ArrayToAB(array: number[]) {
  return {
    time: array[0],
    ask: array[1], ask_volume: array[2],
    bid: array[3], bid_volume: array[4],
  } as AB;
}

async function main() {
  const data = await LoadBigJsonArray('./data/ethusdt-1683364860372.json', ArrayToAB);
  const bot = new SpotSimpleTest(1000, 0.001);
  let holding = false;
  let transactions = 0;
  data.forEach((ab, index) => {
    if (holding) {
      const take_price = bot.Offset(0.01);
      const stop_price = bot.Offset(-0.003);
      if (ab.bid >= take_price || ab.bid <= stop_price) {
        bot.SellAll(ab.bid);
        holding = false;
        transactions++;
      }
    } else {
      bot.BuyAll(ab.ask);
      holding = true;
      transactions++;
    }
  });
  const days = (data[data.length - 1].time - data[0].time) / (1000 * 60 * 60 * 24);
  console.log(bot.ROINet(1766.64, 0.35), bot.Transactions, bot.Transactions / days);
}

main();
