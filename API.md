# NUNUX Keeper API

## Authentification

### Initializes a new authorization transaction.

    GET /oauth/authorize HTTP/1.1

### Get OAuth2 token

    POST /oauth/token HTTP/1.1

## Get API info

    GET /api HTTP/1.1

    HTTP/1.1 200
    Content-Type: application/json
    {
      name: "keeper",
      title: "Nunux Keeper",
      description: "...",
      version: "0.0.1",
      author: "..."
    }

## Category API

### Get all categories

    GET /api/category HTTP/1.1

### Get a category

    GET /api/category/:key HTTP/1.1

### Create a category

    POST /api/category HTTP/1.1

### Update a category

    PUT /api/category/:key HTTP/1.1

### Delete a category

    DELETE /api/category/:key HTTP/1.1

## Document API

### Search documents

    GET /api/document HTTP/1.1

### Create new document

    POST /api/document HTTP/1.1

### Get a document

    GET /api/document/:id HTTP/1.1

### Update a document

    PUT /api/document/:id HTTP/1.1

### Delete a document

    DELETE /api/document/:id HTTP/1.1

### Delete all documents from the trash bin

    DELETE /api/document HTTP/1.1

### Get document's resource

    GET /api/document/:id/resource/:hash HTTP/1.1

    HTTP/1.1 200
    Content-Type: image/png

