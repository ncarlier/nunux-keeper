var logger = require('../helpers').logger;

/**
 * Document object model.
 */
module.exports = function(db) {
  var DocumentSchema = new db.Schema({
    title:       { type: String, required: true },
    body:        { type: String, required: true },
    contentType: { type: String, required: true },
    link:        { type: String },
    owner:       { type: String, required: true },
    date:        { type: Date, default: Date.now }
  });

  return db.model('Document', DocumentSchema);
};

