#!/usr/bin/env node
import { ArrayToKLine, Random, SpotSimpleTest, TC } from 'litebot';
import { RSIMAKD, Params } from '../rsimakd';
import moment from 'moment';

const data = require('../data/BTC_USDT-30m.json');

export
function Slice<T extends TC>(tcs: T[], start?: any, end?: any) {
  const start_timestamp = start != null ? moment(start).valueOf() : -Infinity;
  const end_timestamp = end != null ? moment(end).valueOf() : Infinity;
  return tcs.filter((tc) => tc.time >= start_timestamp && tc.time <= end_timestamp);
}

function main() {
  const kline = Slice(ArrayToKLine(data, false), '2009', '2026');
  const random = new Random<Params>();
  random.Search({
    domain: {
      rsi_period: [2, 100],
      fast_period: [2, 100],
      slow_period: [2, 100],
      k_period: [2, 100],
      d_period: [2, 100],
    },
    target: (params) => {
      const executor = new SpotSimpleTest();
      const bot = new RSIMAKD(executor, params);
      bot.BackTestingBatch(kline);
      return executor.ROI(kline[kline.length - 1].close);
    },
  });
}

main()
