
/**
 * Oauth2 client object model.
 */
module.exports = function(db, conn) {

  var ClientSchema = new db.Schema({
    id:          { type: String, required: true, unique: true },
    name:        { type: String, required: true, unique: true },
    homepage:    { type: String, required: true },
    redirectURI: { type: String, required: true },
    secret:      { type: String, required: true},
    created:     { type: Date, default: Date.now }
  });

  return conn.model('Client', ClientSchema);
};

