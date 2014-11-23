var api = require('../../api');

/**
 * Documents API Routes.
 */
module.exports = function(app) {
  /**
   * @apiDefineSuccessStructure Document
   * @apiSuccess {String} _id          ID of the document.
   * @apiSuccess {String} title        Title of the document.
   * @apiSuccess {String} content      Content of the document.
   * @apiSuccess {String} contentType  Content type of the document.
   * @apiSuccess {String} illustration Illustration of the document.
   * @apiSuccess {String} date         Date of modification.
   * @apiSuccess {String} link         Ref. link.
   * @apiSuccess {String[]} categories Categories of the document.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "_id": "533d8b2be5ded24050aeed13",
   *        "title": "Bla bla",
   *        "content": "<p>bla bla bla...</p>"
   *        "contentType": "text/html"
   *        "illustration": "http://foo.bar/foo.jpg"
   *        "date": "2014-04-08T08:32:28.308Z"
   *        "link": "http://foo.bar"
   *        "categories": ["system-public", "user-foo"]
   *     }
   */

  /**
   * @api {get} /api/document Search user's documents
   * @apiVersion 0.0.1
   * @apiName SearchDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String}  [q]     Search query
   * @apiParam {Integer} [from]  Item index from
   * @apiParam {Integer} [size]  Nb of items to retrieve
   * @apiParam {String}  [order] Sort order (asc or desc)
   *
   * @apiSuccess {Integer}  total             Total nb of documents found.
   * @apiSuccess {Object[]} hits              Documents found.
   * @apiSuccess {String}   hits._id          ID of the document.
   * @apiSuccess {String}   hits.contentType  Content-type of the document.
   * @apiSuccess {String}   hits.illustration Illustration of the document.
   * @apiSuccess {String}   hits.title        Title of the document.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "total": 123,
   *        hits: [{
   *          "_id": "544272014c7473672f95d849",
              "title": "Foo",
   *          "contentType": "text/html",
   *          "illustration": "http://foo.bar/foo.jpg"
   *        },
   *        {...}
   *        ]
   *     }
   */
  app.get('/api/document', api.documents.search);

  /**
   * @api {get} /api/document Get document
   * @apiVersion 0.0.1
   * @apiName GetDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id ID of the document
   *
   * @apiSuccessStructure Document
   */
  app.get('/api/document/:id', api.documents.get);

  /**
   * @api {put} /api/document/:id Update document
   * @apiVersion 0.0.1
   * @apiName UpdateDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String}   id                    ID of the document
   * @apiParam {Object}   document              Document details to update
   * @apiParam {String}   [document.title]      Title of the document.
   * @apiParam {String}   [document.content]    Content of the document.
   * @apiParam {String[]} [document.categories] Categories of the document.
   *
   * @apiSuccessStructure Document
   */
  app.put('/api/document/:id', api.documents.update);

  /**
   * @api {post} /api/document Create document
   * @apiDescription Content-Type of the header define the body nature.
   *
   * The request body can contain html, text, url or binary data (like images).
   * @apiVersion 0.0.1
   * @apiName CreateDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String}   [title]      Title of the document.
   * @apiParam {String}   [url]        Ref. link of the document.
   * @apiParam {String[]} [categories] Categories of the document.
   *
   * @apiHeader {String} Content-Type Content type of the document.
   *
   * @apiSuccessStructure Document
   */
  app.post('/api/document', api.documents.create);

  /**
   * @api {delete} /api/document Delete list of documents
   * @apiDescription A list of document's ID to delete can be passed in the request
   *  payload. This list must be a JSON String array. If no payload is provided,
   *  then all documents in the "Trash Bin" category are deleted.
   * @apiVersion 0.0.1
   * @apiName DeleteDocuments
   * @apiGroup document
   * @apiPermission user
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  app.delete('/api/document', api.documents.del);

  /**
   * @api {delete} /api/documenti/:id Delete a document
   * @apiVersion 0.0.1
   * @apiName DeleteDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id ID of the document
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  app.delete('/api/document/:id', api.documents.del);

  /**
   * @api {get} /api/document/:id/resource/:key Get document resource
   * @apiDescription A document resource is an URL inside the content of the document.
   *
   * Currently only image resources are supported (png, gif, jpg).
   * @apiVersion 0.0.1
   * @apiName GetDocumentResource
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id  ID of the document
   * @apiParam {String} key Key of the resource.
   *
   * This key is obtained by using the following algorithm:
   * - Remove query part of the URL
   * - Extract extension (with the dot)
   * - Create MD5 hash of the URL (without the query part)
   * - Concat the previous extension to the previous hash
   * @apiParam {String} [size] Size of the resource.
   *
   * This is useful to get a thumbnail of the image resource.
   * Only the size "200x150" is supported.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   */
  app.get('/api/document/:id/resource/:key', api.resources.get);

  /**
   * @api {get} /api/document/:id/attachment Get document attachment
   *
   * @apiVersion 0.0.1
   * @apiName GetDocumentAttachment
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id  ID of the document
   * @apiParam {String} [size] Size of the attachment.
   *
   * This is useful to get a thumbnail of the attachment (if the attachment is an image).
   * Only the size "200x150" is supported.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   */
  app.get('/api/document/:id/attachment', api.attachment.get);
};
