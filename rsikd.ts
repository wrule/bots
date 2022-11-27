import { Bot, SpotFull, TC, t } from "litebot";

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
    private readonly params: {
      rsi_period: number,
      k_period: number,
      d_period: number,
    },
  ) {
    super();
  }

  public get length() {
    return 1000;
  }

  protected next(tcs: TC[], queue: Signal[] = []) {
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

  protected exec(signal: Signal) {
    if (signal.sell) {
      this.executor.SellAll(signal.close);
    } else if (signal.buy) {
      this.executor.BuyAll(signal.close);
    }
  }
}
