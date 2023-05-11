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
  const [token_asset, token_fund] = params.symbol.split('/');
  const ticker = await exchange.fetchTicker(params.symbol);
  const less_than_dst = params.less_than / ticker.ask;
  const amount_dst = params.amount / ticker.ask;
  console.log(token_asset, '当前价格: ', ticker.ask, token_fund);
  console.log('以当前价格确定的持仓基线', less_than_dst, token_asset);
  console.log('以当前价格确定的单笔追加额', amount_dst, token_asset);
  // check();
}

main();
