FROM xappmedia/bespoken-encoder:latest

WORKDIR /opt/bespoken/BespokenEncoder

RUN ls -l

RUN git pull

RUN npm install

RUN ./node_modules/typescript/bin/tsc -p .

EXPOSE 9200

CMD node /opt/bespoken/BespokenEncoder/outputs/source/lib/index.js
