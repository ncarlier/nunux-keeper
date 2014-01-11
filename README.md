# NUNUX Keeper

## Features

* Save document
  * Text
    If content type is HTML, then text is sanitize using readability.
    And medias will be downloaded localy (async).
  * URL
    If content type is HTML, see above.
    If content type is an image, then image will be downloaded (async).
  * Image
* Manage categories:
  * Create/edit/delete category
  * Colorize category
  * System categories:
    * "Public" to expose document into user public page
    * "Trash" to remove multiples documents
* Share document:
  * Plugins:
    * Mail
    * QRcode
    * SAAS
* Full text indexation
* Media downloader jobs
* Bookmarklet
* Login with Google OpenID or Mozilla Persona
* RESTFul JSON API
* TDD
* User quotas
* User stats
* Remote file system (pulgins: ftp, dropbox, etc...)

## Stack

* Node.js
* MongoDB
* ElasticSearch
* Redis (optional)

## Too see

- Plugins (downloader and viewer)
- Font Awesome
- Less / Sass
- Twitter Bootstrap 3
- Coffee Script?
- DART ?
- Vagrant
- Docker

-------------------------------------------------------------------------------

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

-----------------------------------------------------------------------------------------------------------------------------------------------------------
