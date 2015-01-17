#!/usr/bin/env node

process.title = 'keeper-model-updater';

var _        = require('underscore'),
    program  = require('commander'),
    logger   = require('../helpers').logger,
    Document = require('../models').Document,
    htmlExtractor = require('../extractors/html'),
    EventEmitter  = require('events').EventEmitter;

var app = new EventEmitter();
var stop = false;

program
  .version('0.0.1')
  .option('-v, --verbose', 'Verbose flag')
  .option('-d, --debug', 'Debug flag')
  .parse(process.argv);

logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error');

logger.info('Starting Document Updater Job...');

_.each(['SIGINT', 'SIGTERM', 'SIGQUIT'], function(signal) {
  process.on(signal, function() {
    logger.info('Stopping Document Updater Job...');
    stop = true;
  });
});

var stream = Document.find().stream();

stream.on('data', function (doc) {
  // do something with the mongoose document
  if (stop) {
    return app.emit('stop');
  }
  if (/^text\/html/.test(doc.contentType)) {
    logger.info('Processing document #%s of user %s ...', doc._id, doc.owner);
    this.pause();
    var self = this;
    htmlExtractor.extract(doc)
    .then(function(_doc) {
      var update = {
        content:   _doc.content,
        resources: _doc.resources,
      };
      if (update.resources.length) {
        update.illustration = update.resources[0].url;
      }
      var options = {
        updateDate: false
      };
      return Document.modify(doc, update, options);
    })
    .then(function(_doc) {
      self.resume();
      logger.info('Processing document #%s of user %s (done)', _doc._id, _doc.owner);
    });
  }
}).on('error', function (err) {
  logger.error('FATAL: ', err);
  return app.emit('error');
}).on('close', function () {
  return app.emit('stop');
});

app.on('stop', function() {
  stream.destroy();
  logger.info('Stopping Document Updater Job: done.');
  process.exit(0);
});

app.on('error', function() {
  stream.destroy();
  logger.info('ERROR: Stopping Document Updater Job: done.');
  process.exit(1);
});

