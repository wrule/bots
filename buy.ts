#!/usr/bin/env node
import { ExFactory } from 'litebot';
import HttpsProxyAgent from 'https-proxy-agent';
import { list } from './list';

async function main() {
  const secret = require('./.secret.json');
  const exchange = ExFactory({
    ...secret.exchange,
    agent: secret.exchange.https_proxy_agent ?
      HttpsProxyAgent(secret.exchange.https_proxy_agent) : undefined,
  });

  let symbol = process.argv[2];
  let amount_str = process.argv[3];
  if (symbol == null) throw 'missing symbol';
  if (amount_str == null) throw 'missing amount';
  symbol = (symbol.includes('/') ? symbol : `${symbol}/USDT`).toUpperCase();
  const target = symbol.split('/')[0];
  const source = symbol.split('/')[1];
  amount_str = amount_str.toUpperCase();
  let amount = amount_str.trim() ? Number(amount_str) : NaN;
  if (amount_str === 'ALL') {
    const balances = await exchange.fetchBalance();
    amount = balances[source].free;
  }
  console.log(symbol, amount, target, source);
  if (isNaN(amount)) throw 'amount illegal';
  await list();
  console.log('start trading...');
  const order = await exchange.createMarketBuyOrder(
    symbol,
    exchange.costToPrecision(symbol, amount),
    {
      quoteOrderQty: exchange.id === 'binance' ?
        exchange.costToPrecision(symbol, amount) : undefined,
      tgtCcy: exchange.id === 'okx' ?
        'quote_ccy' : undefined,
    } as any,
  );
  console.log('trading finish');
  await list();
}

main();
