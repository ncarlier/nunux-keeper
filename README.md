# NUNUX Keeper

> Keep control on what you find.

Nunux Keeper allow you to save articles or medias you found on internet in one place. And this place can be yours.

## Features

* Connect with your Google account (OpenID) or with Mozilla Persona
* Save, classify and index documents.
* A document can be an html page, notes, images and more!
* Documents attached medias are also saved.
* Search a document with powerfull full text queries.
* Access from your mobile or your computer. It's full responsive.
* Easyly save web content while surfing thanks to the awesome bookmarklet.
* Build your own client application thaks to the RESTFul JSON API.

## Roadmap

* Share a document using plugins. Share by mail, QRcode, other web sites;
* Add the ability to choose a different storage system (ftp, remoteStorage, dropbox, etc.);
* Add a user quota for local storage;
* Add some user dashboard with stats;

## Under the hood

The backend is using Node.js. All documents are stored in a MongoDB and are indexed with ElasticSearch using the MongoDB river. Redis is optionnal, but can be used to provide a message queuing system to download medias in background.

The frontend is using AngularJS and for the visual is using LESS with Twitter Bootstrap 3.

## Installation (the -not so- hard way)

This installation procedure is from skratch. You can find below an easiest installation procedure thanks to Docker!

### Prerequisites

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) ~v0.10.0
* [MongoDB](http://www.mongodb.org/) ~v2.4
* [Elasticsearch](http://nodejs.org/) v0.90.10
* [Redis](http://redis.io/) ~v2.8.0 (optional)
* [Imagemagick](http://www.imagemagick.org/)

#### Install Git, Node.JS, MongoDB and Redis (on Debian)

    sudo aptitude install git nodejs mongodb-server redis-server imagemagick

#### Install Elasticsearch (and MongoDB river)

    sudo aptitude install openjdk-7-jre wget
    ES_HOME /opt/Elasticsearcharch
    (cd /tmp && wget https://download.elasticsearch.org/elasticsearch/elasticsearchsticsearch/elasticsearch-0.90.10.tar.gz -O pkg.tar.gz && tar zxf pkg.tar.gz && mv elasticsearch-* $ES_HOME)
    $ES_HOME/bin/plugin -install elasticsearch/elasticsearch-mapper-attachments/1.9.0
    $ES_HOME/bin/plugin -install com.github.richardwilly98.elasticsearch/elasticsearch-river-mongodb/1.7.3

Connect to mongodb and enabled replicaset:

    $ mongo
    > cfg = { "_id" : "rs0", "version" : 1, "members" : [ { "_id" : 0, "host" : "localhost:27017" } ] }
    > rs.initiate(cfg)

#### Install Grunt

    sudo npm install -g grunt-cli

### Install the Keeper

    mkdir -p /opt/node/keeper &&keeper cd $_
    git clone git@github.com:ncarlier/nunux-keeper.git
    cd keeper
    npm install

### Run the Keeper

See "etc/default/keeper-server" for environment configuration.

    npm start

Open your browser, go to http://localhost:3000 and enjoy!

## Installation (the cool way)

### Prerequisites

* [Git](http://git-scm.com/)
* [Docker](http://www.docker.io/)

or a cool docker hosting service.

### Start the Keeper

    # Get Keeper sources
    git clone git@github.com:ncarlier/nunux-keeper.git &&cd keeper
    # Createreate share volumes
    docker run -v ~/src/keeper:/opt/keeper -v ~/var/keeper:/var/opt/keeper -name KEEPER_VOLUMES busybox true
    # Build docker image
    docker build -runm -t nunux/keeper .
    # Start the container
    docker run -rm -link mongodbgo-elastic:db -volumes-from KEEPER_VOLUMES -i -t -p 3000:3000 nunux/keeper /usr/bin/supervisord
    # Enjoy!

----------------------------------------------------------------------

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

----------------------------------------------------------------------
