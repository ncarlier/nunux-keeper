var when       = require('when'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    validators = require('../helpers').validators,
    sanitize   = require('validator').sanitize,
    Category   = require('../models').Category;

/**
 * Convert string to user key.
 */
var convertToUserKey = function(str) {
  // trim and lower case
  var result = str.trim().toLowerCase();
  // Remove unwanted caracters
  result = result.replace(/[^a-z0-9 _-]/g, '').trim();
  // replace spaces by a dash
  return 'user-' + result.replace(/(\s+)/g, '-');
};

module.exports = {
  /**
   * Get an user category.
   */
  get: function(req, res, next) {
    Category.findOne({
      owner: req.user.uid,
      key: req.params.key
    }).exec()
    .then(function(category) {
      if (category) {
        return when.resolve(category);
      } else {
        return when.reject(new errors.NotFound('Category not found.'));
      }
    })
    .then(function(category) {
      res.json(category);
    }, next);
  },

  /**
   * Get all user's categories.
   * Including system's categories.
   */
  all: function(req, res, next) {
    Category.find({owner: req.user.uid}).exec()
    .then(function(data) {
      // Insert system's categories.
      data.unshift({
        key:   'system-public',
        label: 'Public category'
      });
      data.unshift({
        key:   'system-trash',
        label: 'Trash bin'
      });

      res.json(data);
    }, next);
  },

  /**
   * Post new category.
   */
  create: function(req, res, next) {
    if (!req.body.label) {
      return next(new errors.BadRequest('Category label is undefined.'));
    }
    var label = sanitize(req.body.label).trim();
    label = sanitize(label).entityEncode();
    // Sanitize and validate query params
    var color = req.body.color || '#fff';
    if (!validators.isHexColor(color)) {
      return next(new errors.BadRequest('Bad color value.'));
    }

    var category = {
      key:   convertToUserKey(req.body.label),
      owner: req.user.uid,
      label: label,
      color: color
    };
    Category.count({key: category.key, owner: category.owner}).exec()
    .then(function(count) {
      if (count > 0) {
        return next(new errors.BadRequest('Category already exists.'));
      }
      // Save category
      return Category.create(category);
    })
    .then(function(cat) {
      logger.info('Category created: %j', cat);
      res.status(201).json(cat);
    }, next);
  },

  /**
   * Put category modification.
   */
  update: function(req, res, next) {
    var update = {};
    // Sanitize and validate query params
    var label = req.body.label;
    if (label) {
      label = sanitize(label).trim();
      update.label = sanitize(label).entityEncode();
    }
    var color = req.body.color;
    if (color && !validators.isHexColor(color)) {
      return next(new errors.BadRequest('Bad color value.'));
    } else if (color) {
      update.color = color;
    }
    Category.findOne({
      owner: req.user.uid,
      key: req.params.key
    }).exec()
    .then(function(category) {
      if (!category) {
        return when.reject(new errors.NotFound('Category not found.'));
      }
      return Category.findByIdAndUpdate(category._id, update).exec();
    })
    .then(function(category) {
      logger.info('Category updated: %j', category);
      res.status(200).json(category);
    }, next);
  },

  /**
   * Delete a category.
   */
  del: function(req, res, next) {
    Category.findOne({
      owner: req.user.uid,
      key: req.params.key
    }).exec()
    .then(function(category) {
      if (!category) {
        return when.reject(new errors.NotFound('Category not found.'));
      }
      return Category.remove(category).exec();
    })
    .then(function() {
      logger.info('Category deleted: %s', req.params.key);
      res.send(205);
    }, next);
  }
};
