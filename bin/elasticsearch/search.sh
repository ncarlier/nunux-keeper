#!/bin/sh
HOST=$1
#curl -XGET http://localhost:9200/documents/_search?q=owner:foo@bar.com&pretty=true
curl -XPOST http://$HOST:9200/documents/_search -d'
{
  fields: [
    "title"
  ],
  query: {
    filtered: {
      query: {
        query_string: {
          fields: ["title"],
          query: "sample"
        }
      },
      filter : { term : { owner : "foo@bar.com" }
      }
    }
  }
}'
#curl -XPOST http://localhost:9200/documents/_search -d'
#{
#  fields: ["title"],
#  query: { text: { _all: "Sample"}}
#}'
