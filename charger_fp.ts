#!/usr/bin/env node
import { ExFactory } from "litebot";

const secret = require('./.secret.json');
const exchange = ExFactory({ ...secret.exchange });

async function check() {
  try {
    const balance = await exchange.fetchFreeBalance();
    console.log(balance['ETH']);
  } catch (e) {
    console.log(e);
  }
  setTimeout(() => check(), 5000);
}

function main() {
  check();
}

main();
