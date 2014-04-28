var connectors = require('../connectors');

module.exports = {
  twitter: {
    connect: connectors.twitter.connect,
    callback: connectors.twitter.connectCallback,
    disconnect: connectors.twitter.disconnect
  }
};
