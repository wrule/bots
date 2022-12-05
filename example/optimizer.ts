#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest } from 'litebot';
import { MAKD, Params } from '../makd';

const data = require('../data/BTC_USDT-30m.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const random = new Random<Params>();
  random.Search({
    domain: {
      fast_period: [20, 40],
      slow_period: [50, 70],
      k_period: [2, 20],
      d_period: [2, 20],
    },
    target: (params) => {
      const executor = new SpotSimpleTest();
      const bot = new MAKD(executor, params);
      bot.BackTestingBatch(kline);
      return executor.ROI(kline[kline.length - 1].close);
    },
  });
}

main()
