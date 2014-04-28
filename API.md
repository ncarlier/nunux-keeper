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

## Import user subscriptions with OPML file.

    POST /api/subscription HTTP/1.1
    file=<OPML File>

    HTTP/1.1 201
    Content-Type: application/json
    [
      {id:"", title:"", xmlurl:"", htmlurl:"", status="", updateDate=""},
      {id:"", title:"", xmlurl:"", htmlurl:"", status="", updateDate=""},
      ...
    ]

## Add a new subscription

    POST /api/subscription HTTP/1.1
    url=<feed xml url>

    HTTP/1.1 201
    Content-Type: application/json
    {id:"", title:"", xmlurl:"", htmlurl:""}

## Remove a subscription

    DELETE /api/subscription/:id HTTP/1.1

    HTTP/1.1 204

## Get status of a timeline

    GET /api/timeline/:timeline/status HTTP/1.1

    HTTP/1.1 200
    Content-Type: application/json
    {timeline: "", size: 1, title: "", feed: {}}

## Get all timelines

    GET /api/timeline HTTP/1.1

    HTTP/1.1 200
    Content-Type: application/json
    [
      {timeline: "", size: 1, title: "", feed: {}},
      {timeline: "", size: 1, title: "", feed: {}},
      ...
    ]

## Get content of a timeline

    GET /api/timeline/:timeline? HTTP/1.1

    HTTP/1.1 200
    Content-Type: application/json
    {
      articles: [
        {
          id: "",
          title: "",
          author: "",
          date: "",
          description: "",
          enclosures: [],
          link: "",
          meta: {}
        },
        ...
      ],
      order: "ASC",
      next: ""
    }

Query string parameters:

 - next: id of the next article in the timeline
 - order: 'ASC' or 'DESC'
 - show: 'new' or 'all'
 - size: size of the window (10 by default)

## Mark an article in the timeline as read

    DELETE /api/timeline/:timeline/:aid HTTP/1.1

    HTTP/1.1 200
    Content-Type: application/json
    {timeline: "", size: 1, title: "", feed: {}}

## Mark all articles of the timeline as read

    DELETE /api/timeline/:timeline HTTP/1.1

    HTTP/1.1 200
    Content-Type: application/json
    {timeline: "", size: 1, title: "", feed: {}}


------------------------------------------------------------------------------

NUNUX Keeper

Copyright (c) 2014 Nicolas CARLIER (https://github.com/ncarlier)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

------------------------------------------------------------------------------
