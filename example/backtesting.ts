#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest } from 'litebot';
// import { StochRSICross } from '../stoch_rsi_cross';
import { Clams } from '../clams';

const data = require('../data/ETH_USDT-1d.json');

function main() {
  const kline = ArrayToKLine(data, false);
  const executor = new SpotSimpleTest();
  const bot = new Clams(executor, {
    stop_rate: 1,
    take_rate: 1e6,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
}

main();
