FROM bespoken/bespoken-encoder:latest

WORKDIR /opt/bespoken/encoder

RUN ls -l

RUN git checkout ${CIRCLE_TAG}

RUN npm install

RUN npm run build

EXPOSE 9200

CMD npm start
