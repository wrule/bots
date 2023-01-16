#!/usr/bin/env node
import { ExFactory } from 'litebot';

export
async function list() {
  const secret = require('./.secret.json');
  const exchange = ExFactory(secret.exchange);
  const balance = await exchange.fetchFreeBalance();
  Object.entries(balance).forEach(([key, value]) => {
    if (value > 0) console.log(key, value);
  });
}

(() => {
  if (require.main !== module) return;
  list();
})();
