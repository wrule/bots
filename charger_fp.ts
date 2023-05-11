#!/usr/bin/env node
import { ExFactory, FillParams } from "litebot";

const secret = require('./.secret.json');
const exchange = ExFactory({ ...secret.exchange });

async function check() {
  try {
    const balance = await exchange.fetchFreeBalance();
    console.log(balance['ETH']);
  } catch (e) {
    console.log(e);
  }
  setTimeout(() => check(), 5000);
}

async function main() {
  const params = {
    symbol: 'BNB/USDT',
    less_than: 30,
    amount: 12,
  };
  FillParams(params);
  if (!/^\S+\/\S+$/.test(params.symbol)) {
    params.symbol = `${params.symbol}/USDT`;
    console.log(params);
  }
  const ticker = await exchange.fetchTicker(params.symbol);
  console.log(ticker.ask);
  // check();
}

main();
