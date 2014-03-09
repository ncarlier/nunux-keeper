
/**
 * Category object model.
 */
module.exports = function(db, conn) {

  var CategorySchema = new db.Schema({
    key:   { type: String, required: true },
    owner: { type: String, required: true },
    label: { type: String, required: true },
    color: { type: String }
  });
  CategorySchema.index({key: 1, owner: 1}, {unique: true});

  return conn.model('Category', CategorySchema);
};

