#!/usr/bin/env node
import { ccxt } from 'litebot';

async function main() {
  const exchange = new ccxt.binance();
  const tickers = await exchange.fetchTickers(['BTC/USDT', 'ETH/USDT']);
  Object.values(tickers).forEach((item) => {
    console.log(item.symbol, [item.bid, item.ask]);
  });
}

main();
