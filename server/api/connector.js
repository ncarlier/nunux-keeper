var connectors = require('../connectors');

module.exports = {
  twitter: {
    connect: connectors.twitter.connect,
    callback: connectors.twitter.connectCallback,
    disconnect: connectors.twitter.disconnect
  },
  pocket: {
    connect: connectors.pocket.connect,
    callback: connectors.pocket.connectCallback,
    disconnect: connectors.pocket.disconnect,
    importAll: connectors.pocket.importAll
  }
};
