FROM bespoken/encoder:latest

WORKDIR /opt/bespoken/encoder

RUN ls -l

COPY lib/ ./lib/

COPY test/ ./test/

COPY typings/ ./typings/

COPY *.json ./

RUN npm install

RUN npm run build

EXPOSE 9200 443

CMD npm start
