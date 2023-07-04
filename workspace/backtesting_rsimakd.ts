#!/usr/bin/env node
import { ArrayToKLine, ExpandKLine, SpotSimpleTest, TC } from 'litebot';
import moment from 'moment';
import { RSIMAKD } from '../rsimakd';

const data = require('../data/BTC_USDT-30m.json');

export
function Slice<T extends TC>(tcs: T[], start?: any, end?: any) {
  const start_timestamp = start != null ? moment(start).valueOf() : -Infinity;
  const end_timestamp = end != null ? moment(end).valueOf() : Infinity;
  return tcs.filter((tc) => tc.time >= start_timestamp && tc.time <= end_timestamp);
}

function main() {
  const kline = Slice(ExpandKLine(ArrayToKLine(data, false), 0.5), '2019-08', '2026');
  const executor = new SpotSimpleTest(100, 0.001);
  const bot = new RSIMAKD(executor, {
    rsi_period: 8,
    fast_period: 34,
    slow_period: 48,
    k_period: 15,
    d_period: 33,
    stop_rate: 1,
    take_rate: 1e6,
  });
  bot.BackTestingBatch(kline);
  console.log(executor.ROI(kline[kline.length - 1].close));
  // console.log(executor.ROINet(kline[kline.length - 1].close));
}

main();
