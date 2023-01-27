#!/usr/bin/env node
import { DingTalk } from 'litebot';

export
function message(text: string) {
  const secret = require('../.secret.json');
  new DingTalk(secret.notifier).SendMessage(text);
}

(() => {
  if (require.main !== module) return;
  const text = process.argv[2] || 'Hi, Fuck you';
  message(text);
})();
