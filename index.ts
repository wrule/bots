import { ArrayToKLine, OHLCV } from 'litebot';

const data = require('./data/ETH_USDT-1d.json');

function fk(kline: OHLCV[]) {
  const max = Math.max(...kline.map((item) => item.high));
  const min = Math.min(...kline.map((item) => item.low));
  const diff = max - min;
  const level = (num: number) => Math.floor((num - min) / diff * 10);
  const points: [number, number][] = [];
  kline.forEach((item, index) => {
    points.push([level(item.low), level(item.high)]);
    if (index === kline.length - 1) points.push([level(item.close), NaN]);
  });
  console.log(points);
}

async function main() {
  const kline = ArrayToKLine(data);
  console.log('你好，世界');
  fk(kline.splice(kline.length - 10));
}

main();
