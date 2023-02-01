#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest, TC } from 'litebot';
import moment from 'moment';
import { StochRSICross } from '../stoch_rsi_cross';

const data = require('../data/ETH_USDT-30m.json');

export
function Slice<T extends TC>(tcs: T[], start?: any, end?: any) {
  const start_timestamp = start != null ? moment(start).valueOf() : -Infinity;
  const end_timestamp = end != null ? moment(end).valueOf() : Infinity;
  return tcs.filter((tc) => tc.time >= start_timestamp && tc.time <= end_timestamp);
}

function main() {
  const kline = Slice(ExpandKLine(ArrayToKLine(data, false), 0.5), '2009', '2026');
  const executor = new SpotSimpleTest(100, 0.001);
  const bot = new StochRSICross(executor, {
    rsi_period: 13,
    stoch_period: 45,
    k_period: 32,
    d_period: 45,
    stop_rate: 1,
    take_rate: 1e6,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
  // console.log(executor.ROINet(kline[kline.length - 1].close));
}

main();
