#!/bin/sh
HOST=$1
curl -XGET $HOST:9200/_river/keeper/_status
