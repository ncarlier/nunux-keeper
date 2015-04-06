var path = require('path');
var srcDir = path.join(__dirname, '..', '..');

require('blanket')({
  pattern: srcDir
});
