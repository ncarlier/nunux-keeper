#!/bin/bash

USER_ID=$1

if [ -z "$USER_ID" ]; then
    echo "Please, provide a user id to proccess."
    exit 1
fi

USER_DIR=$APP_VAR_DIR/$1/documents/

echo "Processing files of user: $1 ..."
for docdir in $USER_DIR*
do
    echo "Processing documents files: $docdir ..."
    (
    shopt -s nullglob
    files=(${docdir}/_*)
    if [[ "${#files[@]}" -gt 0 ]] ; then
        echo "Moving ${#files[@]} attachment file(s)..."
        mkdir -p $docdir/attachment
        for file in "${files[@]}"; do
            mv "$file" $docdir/attachment/ -v
        done
    fi
    files=($docdir/*.*)
    if [[ "${#files[@]}" -gt 0 ]] ; then
        echo "Moving ${#files[@]} resources file(s)..."
        mkdir -p $docdir/resources
        for file in "${files[@]}"; do
            mv "$file" $docdir/resources/ -v
        done
    fi
    )
    echo "Processing documents files: $docdir [done]"
done
echo "Processing files of user: $1 [done]"
