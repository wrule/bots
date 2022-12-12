#!/usr/bin/env node
import { Bot, DingTalk, SpotFull, SpotReal, ccxt, t, FillParams, OHLCV, KLineWatcherRT, SpotSimpleTest, KLineWatcher } from 'litebot';

export
interface Params {
  fast_period: number;
  slow_period: number;
  stop_rate: number;
  take_rate: number;
}

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
  public constructor(private readonly executor: SpotFull, private readonly params: Params) {
    super();
  }

  public get length() {
    return this.params.slow_period + 1;
  }

  public next(tcs: OHLCV[], queue: Signal[]): Signal[] {
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

  private stop(signal: Signal) {
    const stop_price = this.executor.Offset(-this.params.stop_rate);
    const take_price = this.executor.Offset(this.params.take_rate);
    const need_stop = signal.close <= stop_price;
    const need_take = signal.close >= take_price;
    if (need_stop) this.executor.SellAll(signal.opened ? signal.close : stop_price);
    else if (need_take) this.executor.SellAll(signal.opened ? signal.close : take_price);
    return need_stop || need_take;
  }

  public exec(signal: Signal) {
    if (!signal.closed) this.queue.pop();
    if (this.stop(signal)) return;
    if (signal.sell) this.executor.SellAll(signal.close);
    else if (signal.buy) this.executor.BuyAll(signal.close);
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
    stop_rate: 0.004,
    take_rate: 0.008,
    funds: 15,
    assets: 0,
    final_price: NaN,
    last_action: '',
    init_valuation: NaN,
    rt: true,
    interval: 1000,
  };
  FillParams(params);
  const notifier = new DingTalk(secret.notifier);
  const exchange = new ccxt.binance(secret.exchange);
  console.log('loading market...');
  await exchange.loadMarkets();
  const executor = new SpotReal({ exchange, notifier, ...params });
  const bot = new SMACross(executor, params);
  (params.rt ? new KLineWatcherRT() : new KLineWatcher()).RunBot({ exchange, bot, ...params });
})();
