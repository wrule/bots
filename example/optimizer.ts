#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest } from 'litebot';
import { MAKD, Params } from '../makd';

const data = require('../data/ETH_USDT-15m.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const random = new Random<Params>();
  random.Search({
    domain: {
      fast_period: [33, 33],
      slow_period: [80, 80],
      k_period: [72, 72],
      d_period: [3, 3],
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
