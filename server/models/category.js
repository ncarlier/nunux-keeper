
/**
 * Category object model.
 */
module.exports = function(db) {

  var CategorySchema = new db.Schema({
    key:   { type: String, required: true },
    owner: { type: String, required: true },
    label: { type: String, required: true },
    color: { type: String }
  });
  CategorySchema.index({key: 1, owner: 1}, {unique: true});

  return db.model('Category', CategorySchema);
};

