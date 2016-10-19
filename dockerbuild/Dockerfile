FROM xappmedia/bespoken-encoder:latest

WORKDIR /opt/bespoken/BespokenEncoder

RUN ls -l

RUN git pull

WORKDIR ./server

RUN npm install

RUN ./node_modules/typescript/bin/tsc -p .

EXPOSE 9200

CMD node /opt/bespoken/BespokenEncoder/server/outputs/source/lib/index.js
