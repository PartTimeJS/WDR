FROM node:11

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY wdr.js wdr.js
COPY modules/ modules/

CMD [ "wdr.js" ]
