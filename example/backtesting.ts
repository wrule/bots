#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest } from 'litebot';
import { Clams } from '../clams';

const data = require('../data/BTC_USDT-5m.json');

function main() {
  const kline = ExpandKLine(ArrayToKLine(data, false), 0.5);
  const executor = new SpotSimpleTest(100, -0.001);
  const bot = new Clams(executor, {
    stop_rate: 0.005,
    take_rate: 0.05,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
  console.log(executor.ROINet(kline[kline.length - 1].close));
}

main();
