import { Bot, SpotFull, TC, t, FillParams, DingTalk, ccxt, SpotReal, KLineWatcherRT } from 'litebot';
import { MAKD } from './makd';

export
interface Params {
  rsi_period: number;
  k_period: number;
  d_period: number;
}

export
interface Signal
extends TC {
  k: number;
  d: number;
  diff: number;
  buy: boolean;
  sell: boolean;
}

export
class RSIKD
extends Bot<TC, Signal> {
  public constructor(
    private readonly executor: SpotFull,
    private readonly params: Params,
  ) {
    super();
  }

  public get length() {
    return 1000;
  }

  public next(tcs: TC[], queue: Signal[]) {
    const result = queue.concat(tcs as Signal[]);
    const close = result.map((item) => item.close);
    const rsi_result = t.rsi(close, this.params.rsi_period);
    const k = t.sma(rsi_result, this.params.k_period);
    const d = t.sma(k, this.params.d_period);
    t._align([k, d], close.length);
    result.forEach((last, index) => {
      last.k = k[index];
      last.d = d[index];
      last.diff = k[index] - d[index];
      last.buy = result[index - 1]?.diff <= 0 && last.diff > 0;
      last.sell = result[index - 1]?.diff >= 0 && last.diff < 0;
    });
    return result;
  }

  public exec(signal: Signal) {
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
    name: '跟风狗',
    symbol: 'ETH/USDT',
    timeframe: '1m',
    fast_period: 33,
    slow_period: 80,
    k_period: 72,
    d_period: 3,
    stop_rate: 1,
    take_rate: 1e6,
    interval: 500,
    funds: 15,
    assets: 0,
  };
  FillParams(params);
  const notifier = new DingTalk(secret.notifier);
  const exchange = new ccxt.binance(secret.exchange);
  console.log('loading market...');
  await exchange.loadMarkets();
  const executor = new SpotReal({ exchange, notifier, ...params });
  const bot = new MAKD(executor, params);
  new KLineWatcherRT().RunBot({ exchange, bot, ...params });
})();
