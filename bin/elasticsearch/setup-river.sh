#!/bin/sh
HOST=$1
curl -XPUT $HOST:9200/_river/keeper/_meta -d '
{
  "type": "mongodb",
  "mongodb": {
    "servers": [
      { "host": "127.0.0.1", "port": 27017 }
    ],
    "options": { "secondary_read_preference": true },
    "db": "keeper",
    "collection": "documents"
  },
  "index": {
    "name": "documents",
    "type": "document"
  }
}'
