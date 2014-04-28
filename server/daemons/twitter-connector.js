#!/usr/bin/env node

var _        = require('underscore'),
    util     = require('util'),
    program  = require('commander'),
    logger   = require('../helpers').logger,
    twitter  = require('../connectors').twitter,
    EventEmitter = require('events').EventEmitter;

var app = new EventEmitter();

program
  .version('0.0.1')
  .option('-v, --verbose', 'Verbose flag')
  .option('-d, --debug', 'Debug flag')
  .parse(process.argv);

logger.setLevel(program.debug ? 'debug' : program.verbose ? 'info' : 'error');

if (!twitter) {
  logger.error('Unable to start Twitter connector daemon. Twitter not configured.');
  process.exit(1);
}

logger.info('Starting Twitter connector...');

_.each(['SIGINT', 'SIGTERM', 'SIGQUIT'], function(signal) {
  process.on(signal, function() {
    logger.info('Stopping Twitter connector...');
    app.emit('stop');
  });
});

var stream = twitter.stream('statuses/filter', {track: '#keep', follow: '2463484645'});

app.on('stop', function() {
  stream.stop();
  logger.info('Stopping Timeline Updater: done.');
  process.exit(0);
});

/*twitter.post('statuses/update', { status: 'hello world!' }, function(err, reply) {
  console.log(util.inspect(err || reply));
});*/

//twitter.get('search/tweets', { q: 'test', count: 100 }, function(err, reply) {
//  console.log(util.inspect(err || reply));
//});

stream.on('tweet', function(data) {
  console.log(util.inspect(data));
});

