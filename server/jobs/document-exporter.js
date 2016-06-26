#!/usr/bin/env node

process.title = 'keeper-document-exporter';

var _        = require('underscore'),
    fs       = require('fs'),
    when     = require('when'),
    sequence = require('when/sequence'),
    program  = require('commander'),
    storage  = require('../storage'),
    logger   = require('../helpers').logger,
    JSZip    = require('jszip'),
    Document = require('../models').Document,
    htmlExtractor = require('../extractors/html'),
    EventEmitter  = require('events').EventEmitter;

var app = new EventEmitter();
var stop = false;

program
  .version('0.0.1')
  .option('-v, --verbose', 'Verbose flag')
  .option('-d, --debug', 'Debug flag')
  .option('-u, --user [user]', 'User to export')
  .option('-s, --skip', 'Skip resources files')
  .parse(process.argv);

logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error');

if (!program.user) {
  logger.error('ERROR: User not specified.');
  process.exit(1);
}

logger.info('Starting Document Exporter Job...');

_.each(['SIGINT', 'SIGTERM', 'SIGQUIT'], function(signal) {
  process.on(signal, function() {
    logger.info('Stopping Document Exporter Job...');
    stop = true;
  });
});

var stream = Document.find({ owner: program.user }).stream();

var zip = new JSZip();
var zipFile = program.user + '.zip';

stream.on('data', function (doc) {
  // do something with the mongoose document
  if (stop) {
    return app.emit('stop');
  }
  logger.info('Processing document #%s ...', doc._id);
  this.pause();
  var self = this;
  // Create document folder
  var docFolder = zip.folder(doc._id.toString());
  // Create content file
  docFolder.file('content', doc.content);
  // Create meta data file
  docFolder.file('meta.json', JSON.stringify({
    title: doc.title,
    contentType: doc.contentType,
    categories: doc.categories,
    attachment: doc.attachment,
    resources: doc.resources,
    date: doc.date,
    link: doc.link
  }));

  var promise = when.promise(function(resolve, reject) {
    // Create attachment file
    if (doc.attachment) {
      logger.info('Processing attachment: %s', doc.attachment);
      var attContainer = storage.getContainerName(doc.owner, 'documents', doc._id.toString(), 'attachment');
      storage.info(attContainer, doc.attachment)
      .then(function(infos) {
        if (!infos) {
          logger.error('Attachment not found: ' + doc.attachment);
          return when.resolve();
        }
        return storage.stream(attContainer, doc.attachment)
        .then(function(s) {
          logger.info('Adding attachment: %s', doc.attachment);
          docFolder.file('attachment', s);
          return when.resolve();
        });
      }).then(resolve, reject);
    } else {
      resolve();
    }
  });
  promise.then(function() {
    // Create resources files
    if (!program.skip && doc.resources && doc.resources.length) {
      logger.info('Processing resources: %s', doc.resources.length);
      var resContainer = storage.getContainerName(doc.owner, 'documents', doc._id.toString(), 'resources');
      var resFolder = docFolder.folder('resources');
      var tasks = [];
      doc.resources.forEach(function(res) {
        tasks.push(function() {
          return storage.info(resContainer, res.key)
          .then(function(infos) {
            if (!infos) {
              logger.error('Resource not found: ' + res.key);
              return when.resolve();
            } else {
              return storage.stream(resContainer, res.key)
              .then(function(s) {
                logger.info('Adding resource: %s', res.key);
                resFolder.file(res.key, s);
                return when.resolve();
              });
            }
          });
        });
      });
      return sequence(tasks);
    }
    return when.resolve();
  }).then(function() {
    self.resume();
    logger.info('Processing document #%s (done)', doc._id);
  });
}).on('error', function (err) {
  logger.error('FATAL: ', err);
  return app.emit('error');
}).on('close', function () {
  return app.emit('stop');
});

app.on('stop', function() {
  stream.destroy();
  zip
  .generateNodeStream({type:'nodebuffer',streamFiles:true})
  .pipe(fs.createWriteStream(zipFile))
  .on('finish', function () {
    logger.info('Export file:', zipFile);
    logger.info('Stopping Document Updater Job: done.');
    process.exit(0);
  });
});

app.on('error', function() {
  stream.destroy();
  zip
  .generateNodeStream({type:'nodebuffer',streamFiles:true})
  .pipe(fs.createWriteStream(zipFile + '.partial'))
  .on('finish', function () {
    logger.info('Export file:', zipFile);
    logger.info('Stopping Document Updater Job: done.');
    logger.info('ERROR: Stopping Document Updater Job: done.');
    process.exit(1);
  });
});

