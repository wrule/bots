#!/usr/bin/env node
import { ccxt, ExFactory } from 'litebot';

async function main() {
  const secret = require('./.secret.json');
  const exchange = ExFactory(secret.exchange);
  const balance = await exchange.fetchFreeBalance();
  Object.entries(balance).forEach(([key, value]) => {
    if (value > 0) console.log(key, value);
  });
}

main();
