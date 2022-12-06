#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest } from 'litebot';
// import { StochRSICross } from '../stoch_rsi_cross';
import { Clams } from '../clams';

const data = require('../data/ETH_USDT-1h.json');

function main() {
  const kline = ExpandKLine(ArrayToKLine(data, false), 0.5);
  const executor = new SpotSimpleTest();
  const bot = new Clams(executor, {
    stop_rate: 0.01,
    take_rate: 0.05,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
}

main();
