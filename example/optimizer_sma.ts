#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest } from 'litebot';
import { SMACross, Params } from '../sma_cross';

const data = require('../data/BTC_USDT-1d.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const random = new Random<Params>();
  random.Search({
    domain: {
      fast_period: [9, 9],
      slow_period: [44, 44],
    },
    target: (params) => {
      const executor = new SpotSimpleTest();
      const bot = new SMACross(executor, params);
      bot.BackTestingBatch(kline);
      return executor.ROI(kline[kline.length - 1].close);
    },
  });
}

main()
