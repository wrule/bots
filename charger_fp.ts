#!/usr/bin/env node
import { ExFactory, FillParams } from 'litebot';

const secret = require('./.secret.json');
const exchange = ExFactory({ ...secret.exchange });

async function check(params: any) {
  try {
    const balance = await exchange.fetchFreeBalance();
    console.log(
      params.asset, 'position', balance[params.asset],
      balance[params.asset] < params.baseline_dst ? '<' : '>=',
      'baseline', params.baseline_dst,
      balance[params.asset] < params.baseline_dst ? 'need to buy' : 'no need to buy',
    );
  } catch (e) {
    console.log(e);
  }
  setTimeout(() => check(params), params.interval);
}

async function main() {
  const params: any = {
    symbol: 'BNB/USDT',
    baseline: 22,
    amount: 11,
    interval: 6 * 60 * 60 * 1000,
  };
  FillParams(params);
  if (!/^\S+\/\S+$/.test(params.symbol)) {
    params.symbol = `${params.symbol}/USDT`;
    console.log(params);
  }
  const [asset, fund] = params.symbol.split('/');
  params.asset = asset;
  params.fund = fund;
  const ticker = await exchange.fetchTicker(params.symbol);
  params.baseline_dst = params.baseline / ticker.ask;
  params.amount_dst = params.amount / ticker.ask;
  console.log(asset, 'current price: ', ticker.ask, fund);
  console.log('current price baseline', params.baseline_dst, asset);
  console.log('current price amount', params.amount_dst, asset);
  console.log(params);
  check(params);
}

main();
