import { ArrayToKLine } from 'litebot';

const data = require('./data/BTC_USDT-30m.json');

async function main() {
  const kline = ArrayToKLine(data);
  console.log('你好，世界');
}

main();
