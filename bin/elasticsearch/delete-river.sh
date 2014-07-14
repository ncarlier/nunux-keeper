#!/bin/sh
HOST=$1
curl -XDELETE $HOST:9200/_river/keeper
