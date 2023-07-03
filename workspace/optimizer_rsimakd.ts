#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest } from 'litebot';
import { RSIMAKD, Params } from '../rsimakd';

const data = require('../data/BTC_USDT-30m.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const random = new Random<Params>();
  random.Search({
    domain: {
      rsi_period: [2, 150],
      fast_period: [2, 150],
      slow_period: [2, 150],
      k_period: [2, 150],
      d_period: [2, 150],
    },
    target: (params) => {
      const executor = new SpotSimpleTest();
      const bot = new RSIMAKD(executor, params);
      bot.BackTestingBatch(kline);
      return executor.ROI(kline[kline.length - 1].close);
    },
  });
}

main()
