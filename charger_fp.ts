#!/usr/bin/env node
import moment from 'moment';
import { DingTalk, ExFactory, FillParams } from 'litebot';

const secret = require('./.secret.json');
const exchange = ExFactory({ ...secret.exchange });

function message(data: any) {
  new DingTalk(secret.notifier).SendMessage(JSON.stringify(data, null, 2));
}

async function check(params: any) {
  try {
    const balance = await exchange.fetchFreeBalance();
    const need_to_buy = balance[params.asset] < params.baseline_asset;
    const time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    console.log(
      time,
      params.asset, 'position', balance[params.asset],
      need_to_buy ? '<' : '>=',
      'baseline', params.baseline_asset,
      need_to_buy ? 'need to buy' : 'no need to buy',
    );
    if (need_to_buy) {
      const order = await exchange.createMarketBuyOrder(params.symbol, params.amount_asset);
      const order_info = {
        type: `${params.symbol}_charger_fp_buy`, time,
        in_asset: params.fund, in_amount: order.cost,
        out_asset: params.asset, out_amount: order.amount,
        price: order.price, fee: order.fee,
      };
      console.log(order_info);
      message(order_info);
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
    interval: 2 * 60 * 60 * 1000,
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
  console.log('current price baseline: ', params.baseline_asset, asset);
  console.log('current price amount: ', params.amount_asset, asset);
  console.log(params);
  check(params);
}

main();
