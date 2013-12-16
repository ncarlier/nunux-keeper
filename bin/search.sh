#!/bin/sh
curl -XGET http://localhost:9200/documents/_search?q=$1&pretty=true
