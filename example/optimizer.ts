import { Random, SpotSimpleTest } from 'litebot';
import { MAKD, Params } from '../makd';

function main() {
  const random = new Random<Params>();
  random.Search({
    domain: {
      fast_period: [2, 100],
      slow_period: [2, 100],
      k_period: [2, 100],
      d_period: [2, 100],
    },
    target: (params) => {
      const executor = new SpotSimpleTest();
      const bot = new MAKD(executor, params);
      bot.BackTestingBatch([]);
      return executor.ROI(0);
    },
  });
}
