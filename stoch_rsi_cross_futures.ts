#!/usr/bin/env node
import 'global-agent/bootstrap';
import { Bot, DingTalk, FillParams, TC, t, OHLCV, ArrayToKLine, TimeframeToMS } from 'litebot';
import { WSFuturesKLineWatcher } from '@litebot/ws-futureskline-watcher';
import { CreateBinanceFuturesLong, FullTrader } from '@litebot/trader';
import moment from 'moment';

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
  public constructor(private readonly trader: FullTrader, private readonly params: Params) {
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

  public exec(signal: Signal) {
    if (!signal.closed) this.queue.pop();
    if (signal.sell) {
      this.trader.MarketCloseFull((this.params as any).symbol);
    }
    else if (signal.buy) {
      this.trader.MarketOpenFull((this.params as any).symbol);
    }
  }
}

(async () => {
  if (require.main !== module) return;
  const secret = require('./.secret.binance.json');
  const params = {
    name: '合约红眼',
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
    countdown: 8 * 1e3,
    interval: 1000,
  };
  FillParams(params);
  const notifier = new DingTalk(secret.notifier);
  console.log('loading market...');
  const exchange = await CreateBinanceFuturesLong(secret.exchange);
  const market = exchange.Exchange.market(params.symbol);
  const trader = new FullTrader(exchange, {
    [market.base]: params.assets,
    [market.quote]: params.funds,
  });
  console.log(trader.States());
  const bot = new StochRSICross(trader, params);
  WSFuturesKLineWatcher(exchange.Exchange, params.symbol, (candle) => {
    if (candle.open) {
      console.log({
        ...candle,
        time: moment(candle.time).format('YYYY-MM-DD HH:mm:ss'),
      });
      // bot.Update(candle);
    } else {
      setTimeout(async () => {
        const data = await exchange.Exchange.fetchOHLCV(
          params.symbol,
          params.timeframe, undefined, bot.length + 1,
        );
        data.splice(data.length - 1, 1);
        const kline = ArrayToKLine(data);
        kline.forEach((ohlcv) => bot.Update(ohlcv, false, false));
      }, 1000);
    }
  }, TimeframeToMS(params.timeframe), -1);
})();
