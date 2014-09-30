#!/bin/sh

HOST=$1
if [ -z "$HOST" ]; then
    HOST=`sudo docker inspect --format '{{ .NetworkSettings.IPAddress }}' elasticsearch`
fi

curl -XPUT $HOST:9200/_river/keeper/_meta -d '
{
  "type": "mongodb",
  "mongodb": {
    "servers": [
      { "host": "mongodb", "port": 27017 }
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
