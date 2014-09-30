#!/usr/bin/env node

process.title = 'keeper-resource-downloader';

var _        = require('underscore'),
    when     = require('when'),
    program  = require('commander'),
    download = require('../downloaders/default'),
    logger   = require('../helpers').logger,
    redis    = require('../helpers/redis'),
    EventEmitter = require('events').EventEmitter;

var app = new EventEmitter();
var stop = false;

program
  .version('0.0.1')
  .option('-v, --verbose', 'Verbose flag')
  .option('-d, --debug', 'Debug flag')
  .parse(process.argv);

logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error');

if (!redis) {
  logger.error('Unable to start Resource Downloader daemon. Redis not configured.');
  process.exit(1);
}

logger.info('Starting Resource Downloader...');

_.each(['SIGINT', 'SIGTERM', 'SIGQUIT'], function(signal) {
  process.on(signal, function() {
    logger.info('Stopping Resource Downloader...');
    stop = true;
  });
});

redis.on('connect', function() {
  app.emit('nextresource');
});

app.on('stop', function() {
  // Redis client is not a firnd of Promise :(
  redis.quit(function(err) {
    if (err) {
      logger.error(err);
      process.exit(1);
    } else {
      logger.info('Stopping Resource Downloader: done.');
      process.exit(0);
    }
  });
});

app.on('nextresource', function() {
  if (stop) {
    return app.emit('stop');
  }

  redis.blpop('resources:download', 5, function(err, bulk) {
    if (err) {
      logger.error('FATAL: ', err);
      return app.emit('stop');
    }
    // Get resource to download...
    if (bulk === null) {
      return app.emit('nextresource');
    }
    var resource = JSON.parse(bulk[1]);
    download(resource.urls, resource.dest)
    .then(function() {
      app.emit('nextresource');
    }, function(err) {
      logger.error('Unable to download resources: %j', resource, err);
      app.emit('nextresource');
    });
  });
});

