#!/bin/sh

HOST=$1
if [ -z "$HOST" ]; then
    HOST=`sudo docker inspect --format '{{ .NetworkSettings.IPAddress }}' elasticsearch`
fi

curl -XGET $HOST:9200/_river/keeper/_status
