#!/usr/bin/env node
import { ExFactory, FillParams } from 'litebot';

const secret = require('./.secret.json');
const exchange = ExFactory({ ...secret.exchange });

async function check(params: any) {
  try {
    const balance = await exchange.fetchFreeBalance();
    const need_to_buy = balance[params.asset] < params.baseline_asset;
    console.log(
      params.asset, 'position', balance[params.asset],
      need_to_buy ? '<' : '>=',
      'baseline', params.baseline_asset,
      need_to_buy ? 'need to buy' : 'no need to buy',
    );
    if (need_to_buy) {
      const order = await exchange.createMarketBuyOrder(params.symbol, params.amount_asset);
    }
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
  params.baseline_asset = params.baseline / ticker.ask;
  params.amount_asset = params.amount / ticker.ask;
  console.log(asset, 'current price: ', ticker.ask, fund);
  console.log('current price baseline', params.baseline_asset, asset);
  console.log('current price amount', params.amount_asset, asset);
  console.log(params);
  check(params);
}

main();
