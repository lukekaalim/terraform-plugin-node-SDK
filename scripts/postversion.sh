#!/usr/bin/env bash

version=$(cat package.json | jq .version -r)
tag="terraform-plugin/v$version"

git add .
git commit -m $tag
git tag $tag

git push origin
git push --tags