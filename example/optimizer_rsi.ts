#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest } from 'litebot';
import { RSIKD, Params } from '../rsikd';

const data = require('../data/BTC_USDT-30m.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const random = new Random<Params>();
  random.Search({
    domain: {
      rsi_period: [13, 33],
      k_period: [21, 41],
      d_period: [21, 41],
    },
    target: (params) => {
      const executor = new SpotSimpleTest();
      const bot = new RSIKD(executor, params);
      bot.BackTestingBatch(kline);
      return executor.ROI(kline[kline.length - 1].close);
    },
  });
}

main()
