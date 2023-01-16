#!/usr/bin/env node
import { ExFactory } from 'litebot';
import HttpsProxyAgent from 'https-proxy-agent';

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
  amount_str = amount_str.toUpperCase();
  console.log(symbol, amount_str);
}

main();
