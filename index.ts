import { ArrayToKLine, OHLCV } from 'litebot';

const data = require('./data/ETH_USDT-1d.json');

function extract(kline: OHLCV[]) {
  const max = Math.max(...kline.map((item) => item.high));
  const min = Math.min(...kline.map((item) => item.low));
  const diff = max - min;
  const level = (num: number) => Math.floor((num - min) / diff * 10);
  const result: [number, number][] = [];
  kline.forEach((item, index) => {
    result.push([level(item.low), level(item.high)]);
    if (index === kline.length - 1) result.push([level(item.close), level(item.close)]);
  });
  return result;
}

function belong(kline: OHLCV[], pattern: [number, number][]) {
  if (kline.length + 1 !== pattern.length) return false;
  const sample = extract(kline);
  return pattern.every((item, index) => {
    const low = Math.min(...item);
    const high = Math.max(...item);
    return sample[index][0] >= low && sample[index][1] <= high;
  });
}

async function main() {
  let kline = ArrayToKLine(data);
  kline = kline.splice(kline.length - 3);
  console.log('你好，世界');
  const sample = extract(kline);
  console.log(sample);
  console.log(belong(kline, [
    [3, 8],
    [0, 10],
    [7, 0],
    [6, 5],
  ]));
}

main();
