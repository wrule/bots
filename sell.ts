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
  const source = symbol.split('/')[0];
  const target = symbol.split('/')[1];
  amount_str = amount_str.toUpperCase();

  let amount = amount_str.trim() ? Number(amount_str) : NaN;
  if (amount_str === 'ALL') {
    const balances = await exchange.fetchBalance();
    amount = balances[source].free;
  }
  if (isNaN(amount)) throw 'amount illegal';

  console.log(amount, source, '[-->]', target);
  await exchange.loadMarkets();
  await list();
  console.log('start sell trading...');
  const order = await exchange.createMarketSellOrder(
    symbol,
    exchange.amountToPrecision(symbol, amount),
  );
  console.log('sell trading finish');
  await list();
  console.log(
    order.cost, source,
    '[-', order.price ,'->]',
    order.amount, target,
    order.fee,
  );
}

main();
