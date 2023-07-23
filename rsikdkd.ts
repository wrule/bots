#!/usr/bin/env node
import { Bot, DingTalk, FillParams, KLineWatcher, KLineWatcherRT, SpotFull, SpotReal, TC, ccxt, t, OHLCV, ExFactory } from 'litebot';

export
interface Params {
  rsi_period: number;
  fast_period: number;
  slow_period: number;
  k_period: number;
  d_period: number;
  stop_rate: number;
  take_rate: number;
}

export
interface Signal
extends OHLCV {
  rsi: number;
  k: number;
  d: number;
  diff: number;
  buy: boolean;
  sell: boolean;
}

export
class RSIMAKD
extends Bot<TC, Signal> {
  public constructor(private readonly executor: SpotFull, private readonly params: Params) {
    super();
  }

  public get length() {
    return (t.rsi_start(this.params.rsi_period) + this.params.slow_period + this.params.fast_period + this.params.k_period + this.params.d_period
    + 2) * 4;
  }

  public next(tcs: TC[], queue: Signal[]) {
    const result = queue.concat(tcs as Signal[]);
    const closed = result.filter((item) => item.closed);
    const source = closed.map((item) => item.close);
    const rsi_result = t.rsi(source, this.params.rsi_period)
    
    // const slow_line = t.sma(rsi_result, this.params.slow_period);
    // const fast_line = t.sma(rsi_result, this.params.fast_period, slow_line.length);;

    const fast_line = t.sma(rsi_result, this.params.fast_period);;
    const slow_line = t.sma(fast_line, this.params.slow_period);
    t._align([fast_line, slow_line], slow_line.length)
    
    const diff = fast_line.map((item, index) => item - slow_line[index]);
    const k = t.sma(diff, this.params.k_period);
    const d = t.sma(k, this.params.d_period);
    t._align([rsi_result,k,d], closed.length)
    closed.forEach((last, index) => {
      last.rsi = rsi_result[index];
      last.k = k[index];
      last.d = d[index];
      last.diff = k[index] - d[index];
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
    name: '轮回眼',
    symbol: 'ETH/USDT',
    timeframe: '1m',
    rsi_period: 2,
    fast_period: 3,
    slow_period: 3,
    k_period: 4,
    d_period: 5,
    stop_rate: 1,
    take_rate: 1e6,
    funds: 11,
    assets: 0,
    final_price: NaN,
    last_action: '',
    init_valuation: NaN,
    rt: false,
    countdown: 8 * 1e3,
    interval: 1000,
  };
  FillParams(params);
  const notifier = new DingTalk(secret.notifier);
  const exchange = ExFactory(secret.exchange);
  console.log('loading market...');
  await exchange.loadMarkets();
  const executor = new SpotReal({ exchange, notifier, ...params });
  const bot = new RSIMAKD(executor, params);
  (params.rt ? new KLineWatcherRT() : new KLineWatcher(params.countdown)).RunBot({ exchange, bot, ...params });
})();
