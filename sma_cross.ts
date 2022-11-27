#!/usr/bin/env node
import { Bot, DingTalk, KLineWatcher, SpotFull, SpotReal, TC, ccxt, t, FillParams } from "litebot";

export
interface Signal
extends TC {
  sma_fast: number;
  sma_slow: number;
  diff: number;
  buy: boolean;
  sell: boolean;
}

export
class SMACross
extends Bot<TC, Signal> {
  public constructor(
    private readonly executor: SpotFull,
    private readonly params: { fast_period: number; slow_period: number; },
  ) {
    super();
  }

  public get length() {
    return this.params.slow_period + 1;
  }

  protected next(tcs: TC[], queue: Signal[] = []): Signal[] {
    const result = queue.concat(tcs as Signal[]);
    const close = result.map((item) => item.close);
    const fast_line = t.sma(close, this.params.fast_period, true);
    const slow_line = t.sma(close, this.params.slow_period, true);
    result.forEach((last, index) => {
      last.sma_fast = fast_line[index];
      last.sma_slow = slow_line[index];
      last.diff = last.sma_fast - last.sma_slow;
      last.buy = result[index - 1]?.diff <= 0 && last.diff > 0;
      last.sell = result[index - 1]?.diff >= 0 && last.diff < 0;
    });
    return result;
  }

  protected exec(signal: Signal) {
    if (signal.sell) {
      this.executor.SellAll(signal.close);
    } else if (signal.buy) {
      this.executor.BuyAll(signal.close);
    }
  }
}

(async () => {
  if (require.main !== module) return;
  const secret = require('./.secret.json');
  const params = {
    name: '墙头草',
    symbol: 'ETH/USDT',
    timeframe: '1m',
    fast_period: 9,
    slow_period: 44,
    interval: 0,
    funds: 15,
    assets: 0,
  };
  FillParams(params);
  const notifier = new DingTalk(secret.notifier);
  const exchange = new ccxt.binance(secret.exchange);
  console.log('loading market...');
  await exchange.loadMarkets();
  const executor = new SpotReal({ exchange, notifier, ...params });
  const bot = new SMACross(executor, params);
  new KLineWatcher().RunBot({ exchange, bot, ...params });
})();
