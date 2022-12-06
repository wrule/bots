#!/usr/bin/env node
import moment from 'moment';
import { Bot, DingTalk, SpotFull, SpotReal, ccxt, FillParams, OHLCV, KLineWatcherRT, SpotSimpleTest } from 'litebot';

export
interface Params {
  stop_rate: number;
  take_rate: number;
}

export
interface Signal
extends OHLCV {
  green: boolean;
  buy: boolean;
  sell: boolean;
}

export
class Clams
extends Bot<OHLCV, Signal> {
  public constructor(private readonly executor: SpotFull, private readonly params: Params) {
    super();
  }

  public get length() {
    return 3;
  }

  protected next(tcs: OHLCV[], queue: Signal[] = []): Signal[] {
    const result = queue.concat(tcs as Signal[]);
    const closed = result.filter((item) => item.closed);
    closed.forEach((last, index) => {
      last.green = last.close >= last.open;
      last.buy = closed[index - 2]?.green === false && closed[index - 1]?.green === true && last.green;
      last.sell = closed[index - 2]?.green === true && closed[index - 1]?.green === false && !last.green;
    });
    return result;
  }

  private stop(signal: Signal) {
    const stop_price = this.executor.Offset(-this.params.stop_rate);
    const take_price = this.executor.Offset(this.params.take_rate);
    const need_stop = signal.close <= stop_price;
    const need_take = signal.close >= take_price;
    if (need_stop) {
      // console.log('止损卖', moment(signal.time).format('YYYY-MM-DD HH:mm'), signal.opened ? signal.close : stop_price);
      // console.log('');
      this.executor.SellAll(signal.opened ? signal.close : stop_price);
    }
    else if (need_take) {
      // console.log('止盈卖');
      this.executor.SellAll(signal.opened ? signal.close : take_price);
    }
    return need_stop || need_take;
  }

  protected exec(signal: Signal) {
    if (!signal.closed) this.queue.pop();
    if (this.stop(signal)) return;
    if (signal.sell) {
      // console.log('信号卖', moment(signal.time).format('YYYY-MM-DD HH:mm'), signal.close);
      // console.log('');
      this.executor.SellAll(signal.close);
    }
    else if (signal.buy) {
      // console.log('信号买', moment(signal.time).format('YYYY-MM-DD HH:mm'), signal.close);
      this.executor.BuyAll(signal.close);
    }
  }
}

(async () => {
  if (require.main !== module) return;
  const secret = require('./.secret.json');
  const params = {
    name: '花甲',
    symbol: 'ETH/USDT',
    timeframe: '1m',
    stop_rate: 0.004,
    take_rate: 0.008,
    interval: 1000,
    funds: 15,
    assets: 0,
  };
  FillParams(params);
  const notifier = new DingTalk(secret.notifier);
  const exchange = new ccxt.binance(secret.exchange);
  console.log('loading market...');
  await exchange.loadMarkets();
  const executor = new SpotSimpleTest();
  const bot = new Clams(executor, params);
  new KLineWatcherRT().RunBot({ exchange, bot, ...params });
})();
