FROM bespoken/bespoken-encoder:latest

WORKDIR /opt/bespoken/encoder

RUN ls -l

RUN git pull

RUN npm install

RUN npm run build

EXPOSE 9200

CMD npm start
