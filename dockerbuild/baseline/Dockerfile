## Provides a baseline layer which will install all the necessary components to run the server.

FROM bespoken/centos-ffmpeg:latest

## Installing npm and node.js on centos
RUN mkdir -p /opt/node
WORKDIR /opt/node
RUN curl --silent --location https://rpm.nodesource.com/setup_6.x | bash
RUN yum -y install nodejs

## create directory for server sources
RUN mkdir -p /opt/bespoken/encoder
WORKDIR /opt/bespoken/encoder

## create and pull master for initial build.
RUN git init .
RUN git pull https://github.com/XappMedia/XappAlexaEncoder.git

WORKDIR ./server

RUN npm install

## Build master
RUN ./node_modules/typescript/bin/tsc -p .