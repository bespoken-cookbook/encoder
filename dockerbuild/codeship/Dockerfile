## Provides a baseline layer which will install all the necessary components to run the server.

FROM bespoken/centos-ffmpeg:latest

## Installing npm and node.js on centos
RUN mkdir -p /opt/node
WORKDIR /opt/node
RUN curl --silent --location https://rpm.nodesource.com/setup_6.x | bash
RUN yum -y install nodejs

## create directory for server sources
RUN mkdir -p /opt/bespoken
WORKDIR /opt/bespoken

## create and pull master for initial build.
RUN git clone https://github.com/bespoken/encoder.git

WORKDIR encoder/

RUN npm install

## build typings
RUN node ./node_modules/typings/dist/bin.js install
## Build master
RUN ./node_modules/typescript/bin/tsc -p .