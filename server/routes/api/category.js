var api = require('../../api');

/**
 * Categories API Routes.
 */
module.exports = function(app) {
  /**
   * @apiDefineSuccessStructure Category
   * @apiSuccess {String} key   Key of the category.
   * @apiSuccess {String} label Label of the category.
   * @apiSuccess {String} color Color (only for user category).
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "key": "user-foo",
   *        "label": "Foo category",
   *        "color": "#FE2EC8"
   *     }
   */

  /**
   * @api {get} /api/category Request all user's categories
   * @apiVersion 0.0.1
   * @apiName GetAllCategories
   * @apiGroup category
   * @apiPermission user
   *
   * @apiSuccessStructure Category
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     [{
   *        "key": "system-trash",
   *        "label": "Trash bin"
   *     },
   *     {
   *        "key": "user-foo",
   *        "label": "Foo category",
   *        "color": "#FE2EC8"
   *     },
   *     {...}
   *     ]
   */
  app.get('/api/category', api.categories.all);

  /**
   * @api {get} /api/category/:key Request category details
   * @apiVersion 0.0.1
   * @apiName GetCategoryDetails
   * @apiGroup category
   * @apiPermission user
   *
   * @apiParam {String}  key Key of the category.
   *
   * @apiSuccessStructure Category
   */
  app.get('/api/category/:key', api.categories.get);

  /**
   * @api {put} /api/category/:key Update user category details
   * @apiVersion 0.0.1
   * @apiName UpdateCategory
   * @apiGroup category
   * @apiPermission user
   *
   * @apiParam {String} key Key of the category.
   * @apiParam {Object} category Category to update.
   * @apiParam {String} category.label Labe of the category.
   * @apiParam {String} category.color Color of the category.
   *
   * @apiSuccessStructure Category
   */
  app.put('/api/category/:key', api.categories.update);

  /**
   * @api {post} /api/category Create user category
   * @apiVersion 0.0.1
   * @apiName CreateCategory
   * @apiGroup category
   * @apiPermission user
   *
   * @apiParam {Object} category Category to create.
   * @apiParam {String} category.label Labe of the category.
   * @apiParam {String} category.color Color of the category.
   *
   * @apiSuccessStructure Category
   */
  app.post('/api/category', api.categories.create);

  /**
   * @api {delete} /api/category/:key Delete user category
   * @apiVersion 0.0.1
   * @apiName DeleteCategory
   * @apiGroup category
   * @apiPermission user
   *
   * @apiParam {String} key Key of the category.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  app.delete('/api/category/:key', api.categories.del);
};
