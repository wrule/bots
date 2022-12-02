#!/usr/bin/env node
import { Bot, DingTalk, KLineWatcher, SpotFull, SpotReal, ccxt, t, FillParams, OHLCV } from "litebot";

export
interface Signal
extends OHLCV {
  sma_fast: number;
  sma_slow: number;
  diff: number;
  buy: boolean;
  sell: boolean;
}

export
class SMACross
extends Bot<OHLCV, Signal> {
  public constructor(
    private readonly executor: SpotFull,
    private readonly params: { fast_period: number; slow_period: number; },
  ) {
    super();
  }

  public get length() {
    return this.params.slow_period + 1;
  }

  protected next(tcs: OHLCV[], queue: Signal[] = []): Signal[] {
    const result = queue.concat(tcs as Signal[]);
    const closed = result.filter((item) => item.closed);
    const source = closed.map((item) => item.close);
    const fast_line = t.sma(source, this.params.fast_period, true);
    const slow_line = t.sma(source, this.params.slow_period, true);
    closed.forEach((last, index) => {
      last.sma_fast = fast_line[index];
      last.sma_slow = slow_line[index];
      last.diff = last.sma_fast - last.sma_slow;
      last.buy = closed[index - 1]?.diff <= 0 && last.diff > 0;
      last.sell = closed[index - 1]?.diff >= 0 && last.diff < 0;
    });
    return result;
  }

  private stop_loss = -0.1;
  private stop_profit = 0.1;

  protected exec(signal: Signal) {
    if (!signal.closed) this.queue.pop();
    if (this.executor.Risk(signal.close) < this.stop_loss) {
      // 止损
      this.executor.SellAll(0);
    }
    if (this.executor.Risk(signal.close) > this.stop_profit) {
      // 止盈
      this.executor.SellAll(0);
    }
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
    interval: 1000,
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
