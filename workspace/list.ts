#!/usr/bin/env node
import { ExFactory } from 'litebot';
import HttpsProxyAgent from 'https-proxy-agent';

export
async function list() {
  const secret = require('./.secret.json');
  const exchange = ExFactory({
    ...secret.exchange,
    agent: secret.exchange.https_proxy_agent ?
      HttpsProxyAgent(secret.exchange.https_proxy_agent) : undefined,
  });
  const balance = await exchange.fetchFreeBalance();
  Object.entries(balance).forEach(([key, value]) => {
    if (value > 0) console.log(key, value);
  });
}

(() => {
  if (require.main !== module) return;
  list();
})();
