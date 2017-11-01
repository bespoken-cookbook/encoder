[![Build Status](https://travis-ci.org/bespoken/encoder.svg?branch=master)](https://travis-ci.org/bespoken/encoder)
[![Coverage Status](https://coveralls.io/repos/github/XappMedia/BespokenEncoder/badge.svg?branch=master)](https://coveralls.io/github/XappMedia/BespokenEncoder?branch=master)

# encoder

A simple microservice for encoding raw audio to MP3.

# Dependencies

This project must have ffmpeg install on the machine to run.

https://www.ffmpeg.org/

# API

## Endpoint

POST /encode

### Parameters

sourceURL: The source audio to be encoded  
targetBucket: The S3 bucket to write to  
targetKey: The S3 key to stored this files as in the bucket  
accessKeyID: Optional] The AWS Access Key that has privileges to write to this bucket  
accessSecretKey: [Optional] The AWS Secret Key that has privileges to write to this bucket  

The `accessKeyID` and `accessSecretKey` are options if the bucket being uplaoded is public. 

### Outputs

#### Success

Response Code: 200
Body:	URL to encoded audio (as plain text)

#### Failure

Response Code: 4xx
Body: Error message

# Building

The project is written in TypeScript and node. With NPM installed, building the project is simply:

``` bash
cd ./server
npm install
./node_modules/typescript/bin/tsc -p .
```

Or if typescript is installed globally just:

``` bash
cd ./server
npm install
tsc -p .
```

The output will be in:

``` bash 
./server/outputs/source/main/
```

# Docker

The top-level `./dockerbuild` directory contains a more lightweight docker file that uses the baseline docker image as a base.  The baseline Dockerfile is in `./dockerbuild/baseline` which is responsible for installing all the necessary components needed to install the server on a Docker image.  It will also pull he current Master repo from git, install, and build it which will make it ready to run for any image that uses it.  The baseline is pointing to the repo `xappmedia/bespoken-encoder` and can be built with the command

``` bash
docker build -t xappmedia/bespoken-encoder ./dockerbuild/baseline
```
