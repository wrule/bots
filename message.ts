#!/usr/bin/env node
import { DingTalk } from 'litebot';

export
function message(text: string) {
  const secret = require('./.secret.json');
  new DingTalk(secret.notifier).SendMessage(text);
}

(() => {
  if (require.main !== module) return;
  message('你好，世界');
})();
