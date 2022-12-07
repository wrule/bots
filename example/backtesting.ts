#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest } from 'litebot';
import { StochRSICross } from '../stoch_rsi_cross';
// import { Clams } from '../clams';

const data = require('../data/BTC_USDT-30m.json');

function main() {
  const kline = ExpandKLine(ArrayToKLine(data, false), 0.5);
  const executor = new SpotSimpleTest();
  const bot = new StochRSICross(executor, {
    rsi_period: 10,
    stoch_period: 35,
    k_period: 35,
    d_period: 44,
    stop_rate: 0.35,
    take_rate: 1e6,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
}

main();
