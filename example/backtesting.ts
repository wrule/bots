#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest } from 'litebot';
import { MAKD } from '../makd';

const data = require('../data/BTC_USDT-1h.json');

function main() {
  const kline = ExpandKLine(ArrayToKLine(data, false), 0.5);
  const executor = new SpotSimpleTest();
  const bot = new MAKD(executor, {
    fast_period: 15,
    slow_period: 29,
    k_period: 4,
    d_period: 7,
    stop_rate: 0.1,
    take_rate: 1e6,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
}

main();
