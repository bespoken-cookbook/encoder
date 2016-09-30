#!/bin/bash

## Script to convert the outputs from the encoder library to the docker and build the docker image
## Docker doesn't allow relative paths in the build file so this is to just dump them in to the docker build area.

tsc -p server/
cp server/package.json dockerbuild/
cp server/outputs/source/main/*.js dockerbuild/
docker build -t bespoken/encoder dockerbuild/