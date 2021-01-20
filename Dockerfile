FROM node:lts

RUN mkdir -p /app
WORKDIR /app

RUN npm i lerna -g

COPY . /app
RUN lerna bootstrap

ENV NODE_ENV production
RUN yarn build

EXPOSE 3000
VOLUME ["/app/config.json", "/app/workflow.yml"]

CMD [ "yarn", "serve" ]