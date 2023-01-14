#!/usr/bin/env node
import fs from 'fs';
import { ccxt } from 'litebot';
import HttpsProxyAgent from 'https-proxy-agent';


async function old() {
  const secret = require('../.secret.json');
  const exchange = new ccxt.binance({
    ...secret.exchange,
    options: { defaultType: 'future', hedgeMode: true },
  });
  console.log('加载市场...');
  await exchange.loadMarkets();
  const rsp = await exchange.createMarketBuyOrder(
    'BTC/USDT',
    0.001,
    {
      positionSide: 'SHORT',
      // quoteOrderQty: 40,
    },
  );
  // const rsp = await exchange.createOrder(
  //   'BTC/USDT',
  //   'MARKET',
  //   'buy',
  //   20,
  //   undefined,
  //   {
  //     positionSide: 'LONG',
  //     quoteOrderQty:
  //   },
  // );
  console.log(rsp);
  fs.writeFileSync('output.json', JSON.stringify(rsp, null, 2));
  console.log('你好，世界');
}


async function list(exchange: ccxt.Exchange) {
  const balance = await exchange.fetchFreeBalance();
  Object.entries(balance).forEach(([key, value]) => {
    if (value > 0) console.log(key, value);
  });
}

async function main() {
  const secret = require('./.secret.json');
  const exchange = new ccxt.binance({
    ...secret.exchange,
    options: { defaultType: 'future', hedgeMode: true },
    agent: HttpsProxyAgent('http://127.0.0.1:7890'),
  });
  console.log('开始交易');
  // const order = { };
  const order = await exchange.createMarketBuyOrder(
    'BTC/USDT',
    0.001,
    {
      positionSide: 'SHORT',
      // quoteOrderQty: 40,
    },
  );
  // const order = await exchange.createMarketOrder(
  //   'ETH/USDT',
  //   'buy',
  //   0,
  //   undefined,
  //   {
  //     quoteOrderQty: 11,
  //   },
  // );
  console.log('结束交易，写入结果...');
  fs.writeFileSync('output.json', JSON.stringify(order, null, 2));
}

main();
