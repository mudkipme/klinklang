FROM node:lts

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

RUN npm install && npm cache clean --force

COPY . /app
ENV NODE_ENV production
RUN npm run build

EXPOSE 3000
VOLUME ["/app/config.json", "/app/logs"]

CMD [ "npm", "start" ]
