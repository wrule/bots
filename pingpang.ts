#!/usr/bin/env node --max-old-space-size=12288
import { SpotSimpleTest } from 'litebot';
import { LoadBigJsonArray } from './utils/json';
import { ArrayToAB } from './utils/ab';
import moment from 'moment';

async function main() {
  const data = await LoadBigJsonArray('./data/ethusdt-1683364860372.json', ArrayToAB);
  if (data.length > 0) {
    const start_time = moment(new Date(data[0].time)).format('YYYY-MM-DD HH:mm:ss');
    const end_time = moment(new Date(data[data.length - 1].time)).format('YYYY-MM-DD HH:mm:ss');
    console.log(start_time, '~', end_time);
  }
  return;
  const bot = new SpotSimpleTest(1000, 0.00075);
  let holding = false;
  let lock_time = 0;
  data.forEach((ab) => {
    if (lock_time) {
      const diff = ab.time - lock_time;
      if (diff < 1000 * 60 * 2) return;
      else lock_time = 0;
    }
    if (holding) {
      const risk = bot.Risk(ab.bid);
      if (risk >= 0.01) {
        bot.SellAll(ab.bid);
        holding = false;
      }
      if (risk <= -0.001) {
        bot.SellAll(ab.bid);
        holding = false;
        lock_time = ab.time;
      }
    } else {
      bot.BuyAll(ab.ask);
      holding = true;
    }
  });
  const days = (data[data.length - 1].time - data[0].time) / (1000 * 60 * 60 * 24);
  console.log(
    bot.ROI(1766.64),
    bot.ROINet(1766.64),
    bot.Transactions,
    bot.Transactions / days,
    bot.ExtFeeCount * 0.35 / days,
  );
}

main();
