#!/bin/sh
HOST=$1
curl -XGET $HOST:9200/documents/document/_mapping
