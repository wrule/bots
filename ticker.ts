#!/usr/bin/env node
import { ccxt } from 'litebot';

async function main() {
  let symbols = process.argv.slice(2);
  if (symbols.length < 1) symbols.push('BTC', 'ETH');
  symbols = symbols
    .map((item) => item.includes('/') ? item : `${item}/USDT`)
    .map((item) => item.toUpperCase());
  const exchange = new ccxt.binance();
  const tickers = await exchange.fetchTickers(symbols);
  Object.values(tickers).forEach((item) => {
    console.log(item.symbol, [item.bid, item.ask]);
  });
}

main();
