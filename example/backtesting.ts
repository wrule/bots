#!/usr/bin/env node
import { ArrayToKLine } from 'litebot';

const data = require('../data/ETH_USDT-2h.json');

function main() {
  const kline = ArrayToKLine(data);
}

main();
