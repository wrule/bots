#!/usr/bin/env node
import { ccxt } from 'litebot';

async function main() {
  const secret = require('./.secret.json');
  const exchange = new ccxt.binance(secret.exchange);
  const balance = await exchange.fetchFreeBalance();
  Object.entries(balance).forEach(([key, value]) => {
    if (value > 0) console.log(key, value);
  });
}

main();
