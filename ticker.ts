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
  let symbols = process.argv.slice(2);
  if (symbols.length < 1) symbols.push('BTC', 'ETH');
  symbols = symbols
    .map((item) => item.includes('/') ? item : `${item}/USDT`)
    .map((item) => item.toUpperCase());
  const tickers = await exchange.fetchTickers(symbols);
  Object.values(tickers).forEach((item) => {
    console.log(item.symbol, [item.bid, item.ask]);
  });
}

main();
