FROM bespoken/centos-ffmpeg:latest

## Installing npm and node.js on centos
RUN mkdir -p /usr/node
WORKDIR /usr/node
RUN curl --silent --location https://rpm.nodesource.com/setup_6.x | bash
RUN yum -y install nodejs

## create directory for server sources
RUN mkdir -p /usr/src/bespoken/encoder/
WORKDIR /usr/src/bespoken/encoder/

# App dependencies
COPY ./package.json /usr/src/bespoken/encoder/
RUN npm install

COPY . /usr/src/bespoken/encoder/

EXPOSE 8080
CMD node /usr/src/bespoken/encoder/index.js
