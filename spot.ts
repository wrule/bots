#!/usr/bin/env node
import fs from 'fs';
import { ccxt } from 'litebot';
import HttpsProxyAgent from 'https-proxy-agent';

async function list(exchange: ccxt.Exchange) {
  const balance = await exchange.fetchFreeBalance();
  Object.entries(balance).forEach(([key, value]) => {
    if (value > 0) console.log(key, value);
  });
}

async function main() {
  const secret = require('./.secret.okx.json');
  const exchange = new ccxt.okx({
    ...secret.exchange,
    agent: HttpsProxyAgent('http://127.0.0.1:7890'),
  });
  await list(exchange);
  console.log('开始交易');
  // const order = await exchange.createMarketBuyOrder(
  //   'ETH/USDT',
  //   exchange.costToPrecision('ETH/USDT', 2),
  //   { tgtCcy: 'quote_ccy' },
  // );
  const order = await exchange.createMarketSellOrder(
    'ETH/USDT',
    exchange.amountToPrecision('ETH/USDT', 0.0025743),
    { },
  );
  console.log('结束交易，写入结果...');
  fs.writeFileSync('output.json', JSON.stringify(order, null, 2));
  await list(exchange);
}

main();
