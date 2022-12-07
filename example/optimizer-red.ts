#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest } from 'litebot';
import { StochRSICross, Params } from '../stoch_rsi_cross';

const data = require('../data/BTC_USDT-30m.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const random = new Random<Params>();
  random.Search({
    domain: {
      rsi_period: [5, 14],
      stoch_period: [30, 39],
      k_period: [30, 39],
      d_period: [39, 48],
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
