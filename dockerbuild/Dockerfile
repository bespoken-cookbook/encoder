FROM xappmedia/bespoken-encoder:latest

WORKDIR /opt/bespoken/BespokenEncoder

RUN ls -l

RUN git pull

RUN npm install

EXPOSE 9200

CMD npm start
