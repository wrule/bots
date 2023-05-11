#!/usr/bin/env node
import { ExFactory, FillParams } from "litebot";

const secret = require('./.secret.json');
const exchange = ExFactory({ ...secret.exchange });

async function check(params: any) {
  try {
    const balance = await exchange.fetchFreeBalance();
    console.log(
      params.asset, '持仓', balance[params.asset],
      balance[params.asset] < params.less_than_dst ? '<' : '>=',
      '基线', params.less_than_dst,
      balance[params.asset] < params.less_than_dst ? '需要加仓' : '无需加仓',
    );
  } catch (e) {
    console.log(e);
  }
  setTimeout(() => check(params), params.interval);
}

async function main() {
  const params: any = {
    symbol: 'BNB/USDT',
    less_than: 22,
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
  params.less_than_dst = params.less_than / ticker.ask;
  params.amount_dst = params.amount / ticker.ask;
  console.log(asset, 'current price: ', ticker.ask, fund);
  console.log('current price baseline', params.less_than_dst, asset);
  console.log('current price amount', params.amount_dst, asset);
  console.log(params);
  check(params);
}

main();
