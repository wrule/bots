#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest } from 'litebot';
import { StochRSICross, Params } from '../stoch_rsi_cross';

const data = require('../data/BTC_USDT-30m.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const random = new Random<Params>();
  random.Search({
    domain: {
      rsi_period: [7, 12],
      stoch_period: [32, 37],
      k_period: [32, 37],
      d_period: [41, 46],
    },
    target: (params) => {
      const executor = new SpotSimpleTest();
      const bot = new StochRSICross(executor, params);
      bot.BackTestingBatch(kline);
      return executor.ROI(kline[kline.length - 1].close);
    },
  });
}

main()
