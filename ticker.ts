#!/usr/bin/env node
import { ccxt } from 'litebot';

async function main() {
  const secret = require('./.secret.json');
  const exchange = new ccxt.binance(secret.exchange);
  const ticker = await exchange.fetchTicker('ETH/USDT');
  console.log([ticker.bid, ticker.ask]);
}

main();
