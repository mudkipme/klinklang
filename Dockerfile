FROM node:alpine

RUN mkdir -p /app
WORKDIR /app

ENV NODE_ENV production
COPY package.json /app/

RUN npm install && npm cache clean --force
COPY . /app
RUN npm run build && npm run init

EXPOSE 3001
VOLUME ["/app/config.json", "/app/database"]

CMD [ "npm", "start" ]