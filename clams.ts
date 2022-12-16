#!/usr/bin/env node
import { Bot, DingTalk, FillParams, KLineWatcher, KLineWatcherRT, SpotFull, SpotReal, TC, ccxt, t, OHLCV } from 'litebot';

export
interface Params {
  stop_rate: number;
  take_rate: number;
}

export
interface Signal
extends OHLCV {
  buy: boolean;
  sell: boolean;
}

export
class Clams
extends Bot<TC, Signal> {
  public constructor(private readonly executor: SpotFull, private readonly params: Params) {
    super();
  }

  public get length() {
    return 1000;
  }

  public next(tcs: TC[], queue: Signal[]) {
    const result = queue.concat(tcs as Signal[]);
    const closed = result.filter((item) => item.closed);
    const source = closed.map((item) => item.close);
    closed.forEach((last, index) => {

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
  const exchange = new ccxt.binance(secret.exchange);
  console.log('loading market...');
  await exchange.loadMarkets();
  const executor = new SpotReal({ exchange, notifier, ...params });
  const bot = new Clams(executor, params);
  (params.rt ? new KLineWatcherRT() : new KLineWatcher(params.countdown)).RunBot({ exchange, bot, ...params });
})();
