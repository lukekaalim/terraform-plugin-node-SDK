#!/usr/bin/env bash

version=$(cat package.json | jq .version -r)
tag="$1/v$version"

git add .
git commit -m $tag
git tag $tag

git push origin
git push --tags