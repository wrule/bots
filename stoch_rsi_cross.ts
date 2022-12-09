#!/usr/bin/env node
import { Bot, DingTalk, FillParams, KLineWatcher, SpotFull, SpotReal, TC, ccxt, t, OHLCV } from 'litebot';

export
interface Params {
  rsi_period: number;
  stoch_period: number;
  k_period: number;
  d_period: number;
  stop_rate: number;
  take_rate: number;
}

export
interface Signal
extends OHLCV {
  k: number;
  d: number;
  diff: number;
  buy: boolean;
  sell: boolean;
}

export
class StochRSICross
extends Bot<TC, Signal> {
  public constructor(private readonly executor: SpotFull, private readonly params: Params) {
    super();
  }

  public get length() {
    return (t.rsi_start(this.params.rsi_period) + t.stoch_start({
      k_slowing_period: this.params.k_period,
      k_period: this.params.stoch_period,
      d_period: this.params.d_period,
    }) + 2) * 4;
  }

  public next(tcs: TC[], queue: Signal[]) {
    const result = queue.concat(tcs as Signal[]);
    const closed = result.filter((item) => item.closed);
    const source = closed.map((item) => item.close);
    const rsi_result = t.rsi(source, this.params.rsi_period);
    const { stoch_k, stoch_d } = t.stoch(rsi_result, rsi_result, rsi_result, {
      k_slowing_period: this.params.k_period,
      k_period: this.params.stoch_period,
      d_period: this.params.d_period,
    }, closed.length);
    closed.forEach((last, index) => {
      last.k = stoch_k[index];
      last.d = stoch_d[index];
      last.diff = stoch_k[index] - stoch_d[index];
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
    name: '红眼',
    symbol: 'ETH/USDT',
    timeframe: '1m',
    rsi_period: 2,
    stoch_period: 3,
    k_period: 4,
    d_period: 5,
    stop_rate: 1,
    take_rate: 1e6,
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
  const bot = new StochRSICross(executor, params);
  new KLineWatcher().RunBot({ exchange, bot, ...params });
})();
