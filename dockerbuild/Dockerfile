FROM bespoken/encoder:latest

WORKDIR /opt/bespoken/encoder

RUN git pull https://github.com/XappMedia/XappAlexaEncoder.git

WORKDIR /opt/bespoken/encoder/server

RUN npm install

RUN ./node_modules/typescript/bin/tsc -p .

EXPOSE 8080

CMD node /opt/bespoken/encoder/server/outputs/source/main/index.js
