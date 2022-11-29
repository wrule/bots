import { Bot, SpotFull, TC, t, FillParams, DingTalk, ccxt, SpotReal, KLineWatcher } from 'litebot';

export
interface Params {
  fast_period: number;
  slow_period: number;
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
class MAKD
extends Bot<TC, Signal> {
  public constructor(
    private readonly executor: SpotFull,
    private readonly params: Params,
  ) {
    super();
  }

  public get length() {
    return t.sma_start(this.params.slow_period) +
      t.sma_start(this.params.k_period) +
      t.sma_start(this.params.d_period) + 2;
  }

  protected next(tcs: TC[], queue: Signal[] = []) {
    const result = queue.concat(tcs as Signal[]);
    const close = result.map((item) => item.close);
    const slow_line = t.sma(close, this.params.slow_period);
    const fast_line = t.sma(close, this.params.fast_period, slow_line.length);
    const diff = fast_line.map((item, index) => item - slow_line[index]);
    const k = t.sma(diff, this.params.k_period);
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
    name: '跟风狗',
    symbol: 'ETH/USDT',
    timeframe: '1m',
    fast_period: 2,
    slow_period: 3,
    k_period: 4,
    d_period: 5,
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
  new KLineWatcher().RunBot({ exchange, bot, ...params });
})();
