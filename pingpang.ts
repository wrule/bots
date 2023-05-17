#!/usr/bin/env node --max-old-space-size=12288
import { SpotSimpleTest } from 'litebot';
import { LoadBigJsonArray } from './utils/json';
import { AB, ArrayToAB } from './utils/ab';
import moment from 'moment';

interface Params {
  fee: number;
  stop: number;
  take: number;
}

function test(data: AB[], params: Params) {
  const bot = new SpotSimpleTest(1000, params.fee);
  let holding = false;
  data.forEach((ab) => {
    if (holding) {
      const risk = bot.Risk(ab.bid);
      if (risk >= params.take) {
        bot.SellAll(ab.bid);
        holding = false;
      }
      if (risk <= params.stop) {
        bot.SellAll(ab.bid);
        holding = false;
      }
    } else {
      bot.BuyAll(ab.ask);
      holding = true;
    }
  });
  const last_ab = data[data.length - 1];
  const days = (last_ab.time - data[0].time) / (1000 * 60 * 60 * 24);
  console.log(
    bot.ROI(last_ab.bid),
    bot.Transactions,
    bot.Transactions / days,
    bot.ExtFeeCount * 0.35,
    bot.ExtFeeCount * 0.35 / days,
  );
}

async function main() {
  const data = await LoadBigJsonArray('./data/ethusdt-1683364860372.json', ArrayToAB);
  if (data.length > 0) {
    const start_time = moment(new Date(data[0].time)).format('YYYY-MM-DD HH:mm:ss');
    const end_time = moment(new Date(data[data.length - 1].time)).format('YYYY-MM-DD HH:mm:ss');
    console.log(start_time, '~', end_time);
  }
  test(data, {
    fee: 0.001,
    stop: 0.001,
    take: 0.001,
  });
}

main();
