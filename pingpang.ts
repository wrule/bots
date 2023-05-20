#!/usr/bin/env node --max-old-space-size=12288
import { Random, SpotSimpleTest } from 'litebot';
import { LoadBigJsonArray } from './utils/json';
import { AB, ArrayToAB } from './utils/ab';
import moment from 'moment';

interface Params {
  stop: number;
  take: number;
}

function test(data: AB[], params: Params) {
  const bot = new SpotSimpleTest(1000, 0.001);
  let holding = false;
  const buy_all = (ab: AB) => {
    bot.BuyAll(ab.ask);
    holding = true;
  };
  const sell_all = (ab: AB) => {
    bot.SellAll(ab.bid);
    holding = false;
  };
  let prev_ab: AB;
  data.forEach((ab) => {
    if (!prev_ab) return;
    prev_ab = ab;
  });
  const last_ab = data[data.length - 1];
  const days = (last_ab.time - data[0].time) / (1000 * 60 * 60 * 24);
  // console.log(
  //   'test:',
  //   bot.ROI(last_ab.bid),
  //   bot.Transactions,
  //   bot.Transactions / days,
  //   bot.ExtFeeCount * 0.35,
  //   bot.ExtFeeCount * 0.35 / days,
  // );
  return { roi: bot.ROI(last_ab.bid), transactions: bot.Transactions };
}

async function main() {
  const data = await LoadBigJsonArray('./data/ethusdt-1683364860372.json', ArrayToAB);
  if (data.length > 0) {
    const start_time = moment(new Date(data[0].time)).format('YYYY-MM-DD HH:mm:ss');
    const end_time = moment(new Date(data[data.length - 1].time)).format('YYYY-MM-DD HH:mm:ss');
    console.log(start_time, '~', end_time);
  }
  test(data, {
    stop: -0.005,
    take: 0.01,
  });

  const random = new Random<Params>();
  random.Search({
    domain: {
      stop: [1, 200],
      take: [10, 500],
    },
    mapper: (parmas) => ({ stop: -(parmas.stop / 1000), take: parmas.take / 1000 }),
    filter: (params) => Math.abs(params.take) > Math.abs(params.stop),
    target: (params) => {
      const result = test(data, params);
      if (result.transactions < 100) return  -Infinity;
      if (result.roi < -0.3) return -Infinity;
      console.log('result:', params, result);
      return result.roi;
      // const executor = new SpotSimpleTest();
      // const bot = new StochRSICross(executor, params);
      // bot.BackTestingBatch(kline);
      // return executor.ROI(kline[kline.length - 1].close);
    },
  });
}

main();
