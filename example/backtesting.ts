#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest } from 'litebot';
import { StochRSICross } from '../stoch_rsi_cross';

const data = require('../data/ETH_USDT-30m.json');

function main() {
  const kline = ExpandKLine(ArrayToKLine(data, false), 0.5);
  const executor = new SpotSimpleTest();
  const bot = new StochRSICross(executor, {
    rsi_period: 13,
    k_period: 32,
    d_period: 45,
    stoch_period: 45,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
}

main();
