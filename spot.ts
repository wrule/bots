#!/usr/bin/env node
import fs from 'fs';
import { ccxt } from 'litebot';
import HttpsProxyAgent from 'https-proxy-agent';

async function main() {
  const secret = require('./.secret.json');
  const exchange = new ccxt.binance({
    ...secret.exchange,
    agent: HttpsProxyAgent('http://127.0.0.1:7890'),
  });
  const balance = await exchange.fetchFreeBalance();
  Object.entries(balance).forEach(([key, value]) => {
    if (value > 0) console.log(key, value);
  });
  console.log(1);
  const order = await exchange.createMarketOrder(
    'NFT/USDT',
    'sell',
    5049240.176924,
  );
  console.log(2);
  fs.writeFileSync('output.json', JSON.stringify(order, null, 2));
}

main();
