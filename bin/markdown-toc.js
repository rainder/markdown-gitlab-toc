#!/usr/local/bin/iojs
'use strict';

var commander = require('commander');
var co = require('co');
var packageJson = require('./../package.json');

commander
  .version(packageJson.version)
  .option('-o, --output <path>', 'Output to a file')
  .option('-x, --exclude <path>', 'Exclude matched paths')
  .parse(process.argv);


co(function * () {
  yield require('./../lib/markdown-toc')();
}).catch(function (err) {
  console.error(err.message);
  console.error(err.stack);
});