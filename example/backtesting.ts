#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest } from 'litebot';
import { SMACross } from '../sma_cross';

const data = require('../data/ETH_USDT-2h.json');

function main() {
  const kline = ExpandKLine(ArrayToKLine(data, false), 0.5);
  const executor = new SpotSimpleTest();
  const bot = new SMACross(executor, {
    fast_period: 9,
    slow_period: 44,
    stop_rate: 0.03,
    take_rate: 0.05,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
}

main();
